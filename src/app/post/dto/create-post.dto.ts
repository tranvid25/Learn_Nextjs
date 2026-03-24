import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty({ example: 'My Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'my-title' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Post content here' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({ example: 'published', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsNotEmpty()
  authorId: number;

  @ApiProperty({ example: [1, 2], type: [Number], required: false })
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map(Number);
    if (Array.isArray(value)) return value.map(Number);
    return value as unknown;
  })
  @IsInt({ each: true })
  @IsOptional()
  categoryIds?: number[];
}
