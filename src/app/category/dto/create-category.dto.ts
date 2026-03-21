import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateCategoryDto {
  @ApiProperty({ example: 'Dessert' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
