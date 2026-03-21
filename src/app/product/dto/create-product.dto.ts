import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { ProductType } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'Bún Đậu Mắm Tôm' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Rất ngon và hấp dẫn' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 50000 })
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'FOOD', enum: ProductType })
  @IsNotEmpty()
  @IsEnum(ProductType)
  type: ProductType;
  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Product images (up to 5 files)',
  })
  @IsOptional()
  images?: any[];

  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map(Number);
    if (Array.isArray(value)) return value.map(Number);
    return value as unknown;
  })
  @IsNumber({}, { each: true })
  categoryIds?: number[];
}
