import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

@ApiTags('wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get customer wishlist' })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.wishlistService.findByCustomer(+customerId);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  add(@Body() addToWishlistDto: AddToWishlistDto) {
    return this.wishlistService.add(addToWishlistDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove item from wishlist' })
  remove(@Param('id') id: string) {
    return this.wishlistService.remove(+id);
  }

  @Delete('customer/:customerId/product/:productId')
  @ApiOperation({ summary: 'Remove specific product from wishlist' })
  removeByProduct(
    @Param('customerId') customerId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.removeByProduct(+customerId, +productId);
  }

  @Delete('customer/:customerId/clear')
  @ApiOperation({ summary: 'Clear customer wishlist' })
  clear(@Param('customerId') customerId: string) {
    return this.wishlistService.clear(+customerId);
  }
}
