import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  async findByCustomer(customerId: number): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { customerId },
      relations: ['product', 'product.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async add(addToWishlistDto: AddToWishlistDto): Promise<Wishlist> {
    // Check if already exists
    const existing = await this.wishlistRepository.findOne({
      where: {
        customerId: addToWishlistDto.customerId,
        productId: addToWishlistDto.productId,
      },
    });

    if (existing) {
      return existing;
    }

    const wishlistItem = this.wishlistRepository.create(addToWishlistDto);
    return this.wishlistRepository.save(wishlistItem);
  }

  async remove(id: number): Promise<void> {
    const result = await this.wishlistRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Wishlist item with ID ${id} not found`);
    }
  }

  async removeByProduct(customerId: number, productId: number): Promise<void> {
    await this.wishlistRepository.delete({ customerId, productId });
  }

  async clear(customerId: number): Promise<void> {
    await this.wishlistRepository.delete({ customerId });
  }
}
