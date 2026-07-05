import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomersService } from '../customers/customers.service';
import * as bcrypt from 'bcrypt';
import { AuthenticationException, BadRequestException, DuplicateResourceException } from '../common/exceptions/custom.exceptions';
import { ResponseHelper } from '../common/helpers/response.helper';

type LoginPortal = 'admin' | 'customer';

@Injectable()
export class AuthService {
  constructor(
    private customersService: CustomersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const customer = await this.customersService.findByEmail(email?.trim());
    
    if (customer && customer.password) {
      const isValid = await bcrypt.compare(password, customer.password);
      
      if (isValid) {
        // Convert entity to plain object
        const { password: _, ...result } = customer;
        return result;
      }
    }
    return null;
  }

  async login(email: string, password: string, portal: LoginPortal = 'customer') {
    const customer = await this.validateUser(email?.trim(), password);
    
    if (!customer) {
      throw new AuthenticationException('Invalid email or password');
    }

    const userRole = customer.role || 'customer';
    if (portal === 'admin' && userRole !== 'admin') {
      throw new AuthenticationException('Only admin users can access CMS');
    }

    if (portal === 'customer' && userRole !== 'customer') {
      throw new AuthenticationException('Admin users cannot access customer website');
    }

    const payload = { email: customer.email, sub: customer.id, role: customer.role };
    return {
      message: ResponseHelper.messages.LOGIN_SUCCESS,
      access_token: this.jwtService.sign(payload),
      customer,
    };
  }

  async register(registerDto: any) {
    // Check if customer already exists
    const existingCustomer = await this.customersService.findByEmail(registerDto.email);
    if (existingCustomer) {
      throw new DuplicateResourceException('Customer', 'email', registerDto.email);
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const customer = await this.customersService.create({
      ...registerDto,
      password: hashedPassword,
      role: 'customer',
    });

    // Convert entity to plain object and remove password
    const { password: _, ...result } = customer;
    return {
      message: ResponseHelper.messages.REGISTER_SUCCESS,
      ...result,
    };
  }

  async changePassword(changePasswordDto: { customerId: number; currentPassword: string; newPassword: string }) {
    const { customerId, currentPassword, newPassword } = changePasswordDto;

    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    const customer = await this.customersService.findOne(customerId);
    if (!customer || !customer.password) {
      throw new AuthenticationException('Customer not found or password is not set');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, customer.password);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.customersService.update(customerId, { password: hashedNewPassword });

    return { message: ResponseHelper.messages.PASSWORD_CHANGED };
  }
}
