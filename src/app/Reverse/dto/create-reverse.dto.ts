import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
export class CreateReverseDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({ example: '[EMAIL_ADDRESS]' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @ApiProperty({ example: '0123456789' })
  @IsNotEmpty()
  @IsString()
  phone: string;
  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  datetime: Date;
  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  party: number;
  @ApiProperty({ example: 'Hello' })
  @IsOptional()
  @IsString()
  message?: string;
}
