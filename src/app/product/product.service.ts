import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';
import { ProductType } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string;
    price: number;
    type: ProductType;
    categoryIds?: number[];
    images?: {
      url: string;
      publicId: string;
    }[];
  }) {
    const { images, categoryIds, ...productData } = data;
    return this.prisma.product.create({
      data: {
        ...productData,
        categories:
          categoryIds && categoryIds.length > 0
            ? {
                create: categoryIds.map((id) => ({ categoryId: id })),
              }
            : undefined,
        images: images
          ? {
              create: images,
            }
          : undefined,
      },
      include: {
        images: true,
        categories: { include: { category: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        images: true,
        categories: { include: { category: true } },
      },
    });
  }

  async findById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        categories: { include: { category: true } },
        ratings: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      price?: number;
      type?: ProductType;
      categoryIds?: number[];
      images?: {
        url: string;
        publicId: string;
      }[];
    },
  ) {
    const { images, categoryIds, ...productData } = data;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        categories: categoryIds
          ? {
              deleteMany: {},
              create: categoryIds.map((id) => ({ categoryId: id })),
            }
          : undefined,
      },
      include: {
        images: true,
        categories: { include: { category: true } },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // Delete images first if cascade is not set
      await tx.productImage.deleteMany({
        where: { productId: id },
      });
      // Delete ratings
      await tx.rating.deleteMany({
        where: { productId: id },
      });
      return tx.product.delete({
        where: { id },
      });
    });
  }

  async addImage(productId: number, url: string, publicId: string) {
    return this.prisma.productImage.create({
      data: {
        url,
        publicId,
        productId,
      },
    });
  }

  async findImageById(id: number) {
    return this.prisma.productImage.findUnique({
      where: { id },
    });
  }

  async deleteImageFromDb(id: number) {
    return this.prisma.productImage.delete({
      where: { id },
    });
  }
}
