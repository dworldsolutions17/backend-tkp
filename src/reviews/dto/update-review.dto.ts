import { PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @ApiPropertyOptional({ description: 'Approve/reject review' })
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;
}
