import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PostUncheckedCreateInput, categoryIds?: number[]) {
    return this.prisma.post.create({
      data: {
        ...data,
        categories: {
          create: categoryIds?.map(id => ({ categoryId: id })) || []
        }
      },
      include: { 
        author: { select: { id: true, name: true, email: true } },
        categories: { include: { category: true } }
      },
    });
  }

  async findAll() {
    return this.prisma.post.findMany({
      where: { deletedAt: null },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: { include: { category: true } },
      },
    });
  }

  async findById(id: number) {
    const post = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: { include: { category: true } },
      },
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: number, data: Prisma.PostUncheckedUpdateInput, categoryIds?: number[]) {
    return this.prisma.post.update({
      where: { id },
      data: {
        ...data,
        ...(categoryIds !== undefined && { // Check if categoryIds is explicitly provided
          categories: {
            deleteMany: {}, // Disconnect all existing categories
            create: categoryIds.map(categoryId => ({ categoryId: categoryId })) // Connect new categories
          }
        })
      },
    });
  }

  async remove(id: number) {
    return this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
