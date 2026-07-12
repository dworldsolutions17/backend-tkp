import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Customer } from '../customers/customer.entity';
import { Discount } from '../discounts/discount.entity';
import { CsvHelper } from '../common/csv.helper';
import { PaginatedResponse, PaginationHelper } from '../common/pagination.helper';
import { ResourceNotFoundException } from '../common/exceptions/custom.exceptions';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { OrderStatus, UpdateOrderDto } from './dto/update-order.dto';

const VALID_ORDER_STATUSES = new Set<string>([
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
  OrderStatus.REJECTED,
  OrderStatus.CANCELLED,
]);

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Discount)
    private discountsRepository: Repository<Discount>,
  ) {}

  private normalizeStatus(status?: string): string {
    if (!status) return OrderStatus.PENDING;
    const normalized = status.trim().toLowerCase();
    return VALID_ORDER_STATUSES.has(normalized) ? normalized : OrderStatus.PENDING;
  }

  async findAll(queryOrdersDto: QueryOrdersDto): Promise<PaginatedResponse<Order>> {
    const { page = 1, limit = 10, status, customerId } = queryOrdersDto;
    const skip = PaginationHelper.getSkip(page, limit);

    const whereClause: Record<string, unknown> = {};
    if (status) {
      whereClause.status = this.normalizeStatus(status);
    }
    if (customerId) {
      whereClause.customerId = customerId;
    }

    const [data, total] = await this.ordersRepository.findAndCount({
      relations: ['customer', 'items'],
      where: whereClause,
      skip,
      take: limit,
      order: { orderDate: 'DESC' },
    });

    return PaginationHelper.paginate(data, total, page, limit);
  }

  findOne(id: number): Promise<Order> {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['customer', 'items'],
    });
  }

  async create(createOrderDto: any): Promise<Order> {
    try {
      const { customerId, items, shippingAddress, totalAmount, discount = 0, shippingCost = 0, status = 'pending', notes, paymentMethod, discountCode } = createOrderDto;

      // Validate inputs
      if (!customerId) {
        throw new BadRequestException('Customer ID is required');
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new BadRequestException('At least one order item is required');
      }

      if (!shippingAddress) {
        throw new BadRequestException('Shipping address is required');
      }

      // Get customer info
      const customer = await this.customersRepository.findOne({
        where: { id: customerId },
      });

      if (!customer) {
        throw new ResourceNotFoundException('Customer', `ID ${customerId}`);
      }

      // Validate items
      const validationErrors: Record<string, string[]> = {};
      items.forEach((item: any, index: number) => {
        const itemErrors: string[] = [];
        if (!item.productId) itemErrors.push('Product ID is required');
        if (!item.quantity || item.quantity < 1) itemErrors.push('Quantity must be at least 1');
        if (!item.price || parseFloat(item.price) < 0) itemErrors.push('Price must be a positive number');
        
        if (itemErrors.length > 0) {
          validationErrors[`items[${index}]`] = itemErrors;
        }
      });

      if (Object.keys(validationErrors).length > 0) {
        throw new BadRequestException('Invalid order items', validationErrors);
      }

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Calculate subtotal from items
      const subtotal = items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * item.quantity), 0);

      // Create the order
      const order = this.ordersRepository.create({
        orderNumber,
        customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress,
        subtotal,
        discount,
        shippingCost,
        total: totalAmount || (subtotal - discount + shippingCost),
        status: this.normalizeStatus(status),
        notes,
        paymentMethod,
        discountCode,
      });

      const savedOrder = await this.ordersRepository.save(order);

      // Create order items
      if (items && items.length > 0) {
        const orderItems = items.map((item: any) => {
          const itemSubtotal = parseFloat(item.price) * item.quantity;
          return this.orderItemsRepository.create({
            orderId: savedOrder.id,
            productId: item.productId,
            productName: item.productName || `Product ${item.productId}`,
            quantity: item.quantity,
            price: parseFloat(item.price),
            subtotal: itemSubtotal,
          });
        });
        await this.orderItemsRepository.save(orderItems);
      }

      // Increment discount usage if a coupon was applied
      if (discountCode) {
        await this.discountsRepository.increment({ code: discountCode }, 'used', 1);
      }

      // Return order with items
      return this.findOne(savedOrder.id);
    } catch (error) {
      // Re-throw custom exceptions
      if (error instanceof BadRequestException || error instanceof ResourceNotFoundException) {
        throw error;
      }
      // Wrap other errors
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) {
      throw new ResourceNotFoundException('Order', `ID ${id}`);
    }

    const nextStatus = updateOrderDto.status ? this.normalizeStatus(updateOrderDto.status) : order.status;
    const patch: Partial<Order> = {
      status: nextStatus,
      rejectionReason: updateOrderDto.rejectionReason ?? order.rejectionReason,
      trackingNumber: updateOrderDto.trackingNumber ?? order.trackingNumber,
      trackingUrl: updateOrderDto.trackingUrl ?? order.trackingUrl,
      estimatedDelivery: updateOrderDto.estimatedDelivery ? new Date(updateOrderDto.estimatedDelivery) : order.estimatedDelivery,
      deliveredAt: updateOrderDto.deliveredAt ? new Date(updateOrderDto.deliveredAt) : order.deliveredAt,
    };

    if (nextStatus === OrderStatus.REJECTED && !updateOrderDto.rejectionReason?.trim()) {
      throw new BadRequestException('Rejection reason is required when order status is rejected');
    }

    if (nextStatus === OrderStatus.SHIPPED && !updateOrderDto.trackingNumber?.trim()) {
      throw new BadRequestException('Tracking number is required when order status is shipped');
    }

    if (nextStatus !== OrderStatus.REJECTED) {
      patch.rejectionReason = null;
    }

    if (nextStatus !== OrderStatus.SHIPPED && nextStatus !== OrderStatus.COMPLETED) {
      patch.trackingNumber = null;
      patch.trackingUrl = null;
      patch.estimatedDelivery = null;
    }

    if (nextStatus === OrderStatus.COMPLETED) {
      patch.deliveredAt = patch.deliveredAt || new Date();
    } else {
      patch.deliveredAt = null;
    }

    await this.ordersRepository.update(id, patch);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.ordersRepository.delete(id);
  }

  async exportToCSV(): Promise<string> {
    const orders = await this.ordersRepository.find({
      relations: ['customer', 'items'],
    });

    const exportData = orders.map((order) => ({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      subtotal: order.subtotal,
      discount: order.discount,
      shippingCost: order.shippingCost,
      total: order.total,
      status: order.status,
      notes: order.notes || '',
      orderDate: order.orderDate,
      items: order.items.map(item => `${item.productName}(${item.quantity}x${item.price})`).join('; '),
    }));

    return CsvHelper.generateCSV(exportData);
  }

  async importFromCSV(buffer: Buffer): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const rows = await CsvHelper.parseCSV<any>(buffer);
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      // Group rows by order number (Shopify exports multiple rows per order for line items)
      const orderGroups = new Map<string, any[]>();
      
      for (const row of rows) {
        const orderNumber = (row.Name || row.orderNumber || '').replace('#', '').trim();
        if (!orderNumber) continue;
        
        if (!orderGroups.has(orderNumber)) {
          orderGroups.set(orderNumber, []);
        }
        orderGroups.get(orderNumber).push(row);
      }

      for (const [orderNumber, orderRows] of orderGroups) {
        try {
          const firstRow = orderRows[0]; // Main order data is in the first row
          
          // Skip if essential data is missing
          const customerEmail = firstRow.Email || firstRow.customerEmail;
          if (!customerEmail && !firstRow['Billing Name'] && !firstRow['Shipping Name']) {
            failed++;
            errors.push(`Order ${orderNumber}: Missing customer information`);
            continue;
          }

          // Map Shopify CSV columns to our schema
          const customerName = firstRow['Billing Name'] || firstRow['Shipping Name'] || firstRow.customerName || 'Guest';
          const customerPhone = firstRow['Billing Phone'] || firstRow['Shipping Phone'] || firstRow.customerPhone || '';
          const shippingAddress = firstRow['Shipping Address1'] || firstRow['Billing Address1'] || firstRow.shippingAddress || 'N/A';
          const shippingCity = firstRow['Shipping City'] || firstRow['Billing City'] || '';
          const fullAddress = shippingCity ? `${shippingAddress}, ${shippingCity}` : shippingAddress;

          // Find or create customer
          let customer = null;
          if (customerEmail) {
            customer = await this.customersRepository.findOne({
              where: { email: customerEmail },
            });

            if (!customer) {
              customer = await this.customersRepository.save({
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                address: fullAddress,
                city: shippingCity || null,
              });
            }
          }

          // Check if order already exists
          const existingOrder = await this.ordersRepository.findOne({
            where: { orderNumber: orderNumber },
          });

          if (!existingOrder) {
            // Parse financial data
            const subtotal = parseFloat(firstRow.Subtotal || firstRow.subtotal || '0');
            const discount = parseFloat(firstRow['Discount Amount'] || firstRow.discount || '0');
            const shippingCost = parseFloat(firstRow.Shipping || firstRow.shippingCost || '0');
            const total = parseFloat(firstRow.Total || firstRow.total || '0');
            
            // Map status
            let status = 'pending';
            const financialStatus = (firstRow['Financial Status'] || firstRow.status || '').toLowerCase();
            const fulfillmentStatus = (firstRow['Fulfillment Status'] || '').toLowerCase();
            
            if (financialStatus === 'paid' && fulfillmentStatus === 'fulfilled') {
              status = 'completed';
            } else if (financialStatus === 'voided' || financialStatus === 'cancelled') {
              status = 'cancelled';
            } else if (fulfillmentStatus === 'fulfilled') {
              status = 'shipped';
            } else if (financialStatus === 'paid') {
              status = 'processing';
            }

            // Create order
            const order = await this.ordersRepository.save({
              orderNumber: orderNumber,
              customerId: customer?.id || null,
              customerName: customerName,
              customerEmail: customerEmail || '',
              customerPhone: customerPhone,
              shippingAddress: fullAddress,
              subtotal: subtotal,
              discount: discount,
              shippingCost: shippingCost,
              total: total,
              status: this.normalizeStatus(status),
              notes: firstRow.Notes || firstRow.notes || null,
              orderDate: firstRow['Created at'] || firstRow.orderDate ? new Date(firstRow['Created at'] || firstRow.orderDate) : new Date(),
            });

            success++;
          } else {
            // Update existing order status
            const financialStatus = (firstRow['Financial Status'] || firstRow.status || '').toLowerCase();
            const fulfillmentStatus = (firstRow['Fulfillment Status'] || '').toLowerCase();
            
            let status = existingOrder.status;
            if (financialStatus === 'paid' && fulfillmentStatus === 'fulfilled') {
              status = 'completed';
            } else if (financialStatus === 'voided' || financialStatus === 'cancelled') {
              status = 'cancelled';
            } else if (fulfillmentStatus === 'fulfilled') {
              status = 'shipped';
            } else if (financialStatus === 'paid') {
              status = 'processing';
            }

            await this.ordersRepository.update(existingOrder.id, {
              status: this.normalizeStatus(status),
              notes: firstRow.Notes || existingOrder.notes,
            });
            success++;
          }
        } catch (error) {
          failed++;
          errors.push(`Order ${orderNumber}: ${error.message}`);
        }
      }

      return { success, failed, errors };
    } catch (error) {
      throw new BadRequestException(`Failed to parse CSV: ${error.message}`);
    }
  }
}
