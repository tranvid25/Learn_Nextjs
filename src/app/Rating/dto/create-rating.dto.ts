import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  star?: number;

  @IsString()
  @IsOptional()
  comment: string;

  @IsNumber()
  productId: number;

  @IsNumber()
  userId: number;

  @IsNumber()
  @IsOptional()
  parentId: number;
}
