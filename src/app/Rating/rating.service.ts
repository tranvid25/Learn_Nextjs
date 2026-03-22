import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data:{
    productId: number;
    userId: number;
    parentId?: number | null;
    star: number;
    comment?: string | null;
  }){
    const rating = await this.prisma.rating.create({
      data,
    });
    if (!data.parentId) {
      await this.updateProductRatingStats(data.productId);
    }
    return rating;
  }
  async findAll(){
    return this.prisma.rating.findMany({
      include:{
        user:{
          select:{
            id:true,
            name:true,
            email:true,
          }
        }
      }
    })
  }
  async findById(id: number){
    return this.prisma.rating.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
  async findParentByProductAndUser(productId: number, userId: number){
    return this.prisma.rating.findFirst({
      where: {
        productId,
        userId,
        parentId: null, // Only parent rating should be checked for duplicates
      },
    });
  }
  async findAllByProduct(productId: number){
    return this.prisma.rating.findMany({
      where: { 
        productId,
        parentId: null, // Top level comments
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async update(id: number, data: {
    star?: number;
    comment?: string | null;
  }){
    const rating = await this.prisma.rating.update({
      where: { id },
      data,
    });
    if (!rating.parentId && data.star !== undefined) {
      await this.updateProductRatingStats(rating.productId);
    }
    return rating;
  }
  async delete(id: number){
    const rating = await this.prisma.rating.delete({
      where: { id },
    });
    if (!rating.parentId) {
      await this.updateProductRatingStats(rating.productId);
    }
    return rating;
  }
  async updateProductRatingStats(productId: number){
    const agg = await this.prisma.rating.aggregate({
      where: { productId, parentId: null }, // Only parent ratings affect stats
      _avg: { star: true },
      _count: { id: true },
    });

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        ratingAvg: agg._avg.star || 0,
        ratingCount: agg._count.id || 0,
      },
    });
  }
}
