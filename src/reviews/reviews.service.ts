import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse, PaginationHelper } from '../common/pagination.helper';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async findAll(paginationDto: PaginationDto, filters?: any): Promise<PaginatedResponse<Review>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = PaginationHelper.getSkip(page, limit);

    const query = this.reviewsRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('review.customer', 'customer');

    if (filters?.productId) {
      query.andWhere('review.productId = :productId', { productId: filters.productId });
    }

    if (filters?.isTestimonial !== undefined) {
      query.andWhere('review.isTestimonial = :isTestimonial', { isTestimonial: filters.isTestimonial });
    }

    if (filters?.isApproved !== undefined) {
      query.andWhere('review.isApproved = :isApproved', { isApproved: filters.isApproved });
    }

    query.orderBy('review.createdAt', 'DESC');

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return PaginationHelper.paginate(data, total, page, limit);
  }

  async findTestimonials(approved: boolean = true): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { isTestimonial: true, isApproved: approved },
      order: { createdAt: 'DESC' },
    });
  }

  async findByProduct(productId: number, approved: boolean = true): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { productId, isApproved: approved },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['product', 'customer'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const review = this.reviewsRepository.create({
      ...createReviewDto,
      isApproved: createReviewDto.isTestimonial ? false : true,
    });
    return this.reviewsRepository.save(review);
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    await this.reviewsRepository.update(id, updateReviewDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.reviewsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
  }

  async approve(id: number): Promise<Review> {
    return this.update(id, { isApproved: true });
  }

  async getProductRating(productId: number): Promise<{ average: number; count: number }> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId = :productId', { productId })
      .andWhere('review.isApproved = :isApproved', { isApproved: true })
      .getRawOne();

    return {
      average: parseFloat(result.average) || 0,
      count: parseInt(result.count) || 0,
    };
  }
}
