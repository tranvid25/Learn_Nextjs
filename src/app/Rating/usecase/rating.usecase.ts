import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RatingService } from '../rating.service';
import { PrismaService } from 'src/infra/database/prisma.service';
import { CreateRatingDto } from '../dto/create-rating.dto';
import { UpdateRatingDto } from '../dto/update-rating.dto';
import { RATING_ERROR_MESSAGES } from '../constants/rating.constant';

@Injectable()
export class RatingUseCase {
  constructor(
    private readonly ratingService: RatingService,
    private readonly prisma: PrismaService,
  ) {}

  async createRating(createRatingDto: CreateRatingDto) {
    const { productId, userId, parentId, star, comment } = createRatingDto;

    // 1. Validate Product
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(RATING_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    // 2. Validate Parent Rating (if present)
    if (parentId) {
      const parent = await this.ratingService.findById(parentId);
      if (!parent) {
        throw new NotFoundException(RATING_ERROR_MESSAGES.PARENT_NOT_FOUND);
      }
      if (parent.productId !== productId) {
        throw new BadRequestException('Parent rating must belong to the same product');
      }
    }

    // 3. Prevent duplicate parent ratings per user (allow multiple replies)
    if (!parentId) {
      if (typeof star !== 'number') {
        throw new BadRequestException('Star rating is required for product reviews');
      }
      const existingParent = await this.ratingService.findParentByProductAndUser(productId, userId);
      if (existingParent) {
        throw new BadRequestException(RATING_ERROR_MESSAGES.ALREADY_RATED);
      }
    }

    // 4. Create Rating
    return this.ratingService.create({
      productId,
      userId,
      parentId: parentId || null,
      star: star || 5, // if reply, star can be 5 or any default since it doesn't aggregate
      comment,
    });
  }

  async getAllRatings() {
    return this.ratingService.findAll();
  }

  async getRatingsByProduct(productId: number) {
    return this.ratingService.findAllByProduct(productId);
  }

  async updateRating(id: number, updateRatingDto: UpdateRatingDto) {
    const existing = await this.ratingService.findById(id);
    if (!existing) {
      throw new NotFoundException(RATING_ERROR_MESSAGES.NOT_FOUND);
    }

    return this.ratingService.update(id, {
      star: updateRatingDto.star ?? existing.star,
      comment: updateRatingDto.comment ?? existing.comment,
    });
  }

  async deleteRating(id: number) {
    const existing = await this.ratingService.findById(id);
    if (!existing) {
      throw new NotFoundException(RATING_ERROR_MESSAGES.NOT_FOUND);
    }

    // Since Prisma relation doesn't use onDelete: Cascade,
    // we manually delete the replies first
    await this.prisma.rating.deleteMany({
      where: { parentId: id },
    });

    // Delete the parent rating
    await this.ratingService.delete(id);

    return true;
  }
}
