import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';
import { CreateReverseDto } from './dto/create-reverse.dto';
import { UpdateReverseDto } from './dto/update-reverse.dto';

@Injectable()
export class ReverseService {
  constructor(private readonly prisma: PrismaService) {}
  async createReverse(createReverseDto: CreateReverseDto) {
    return this.prisma.reverse.create({
      data: createReverseDto,
    });
  }
  async findAllReverse() {
    return this.prisma.reverse.findMany();
  }
  async findByIdReverse(id: number) {
    return this.prisma.reverse.findUnique({
      where: { id },
    });
  }
  async updateReverse(id: number, updateReverseDto: UpdateReverseDto) {
    return this.prisma.reverse.update({
      where: { id },
      data: updateReverseDto,
    });
  }
  async removeReverse(id: number) {
    return this.prisma.reverse.delete({
      where: { id },
    });
  }
}
