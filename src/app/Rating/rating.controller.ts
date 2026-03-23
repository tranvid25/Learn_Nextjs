import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { ApiResponse } from 'src/common/base/api-response';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingUseCase } from './usecase/rating.usecase';

@ApiTags('Ratings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rating')
export class RatingController {
  constructor(private readonly ratingUseCase: RatingUseCase) {}

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all top-level ratings' })
  async findAll() {
    const data = await this.ratingUseCase.getAllRatings();
    return ApiResponse.ok(data, 'Ratings retrieved successfully');
  }

  @Get('product/:productId')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get all ratings for a given product (includes replies)',
  })
  async findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    const data = await this.ratingUseCase.getRatingsByProduct(productId);
    return ApiResponse.ok(data, 'Product ratings retrieved successfully');
  }

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a rating or reply' })
  async create(@Body() createRatingDto: CreateRatingDto) {
    const data = await this.ratingUseCase.createRating(createRatingDto);
    return ApiResponse.ok(data, 'Rating created successfully');
  }

  @Patch(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update your rating or reply' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    const data = await this.ratingUseCase.updateRating(id, updateRatingDto);
    return ApiResponse.ok(data, 'Rating updated successfully');
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a rating and its replies' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.ratingUseCase.deleteRating(id);
    return ApiResponse.ok(null, 'Rating deleted successfully');
  }
}
