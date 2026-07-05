import { Controller, Get, Post, Put, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reviews with pagination' })
  findAll(@Query() paginationDto: PaginationDto, @Query() filters: any) {
    return this.reviewsService.findAll(paginationDto, filters);
  }

  @Get('testimonials')
  @ApiOperation({ summary: 'Get approved testimonials' })
  findTestimonials(@Query('approved') approved: string) {
    return this.reviewsService.findTestimonials(approved === 'false' ? false : true);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reviews for a specific product' })
  findByProduct(
    @Param('productId') productId: string,
    @Query('approved') approved: string,
  ) {
    return this.reviewsService.findByProduct(+productId, approved === 'false' ? false : true);
  }

  @Get('product/:productId/rating')
  @ApiOperation({ summary: 'Get product rating statistics' })
  getProductRating(@Param('productId') productId: string) {
    return this.reviewsService.getProductRating(+productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new review' })
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update review' })
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve review' })
  approve(@Param('id') id: string) {
    return this.reviewsService.approve(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete review' })
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(+id);
  }
}
