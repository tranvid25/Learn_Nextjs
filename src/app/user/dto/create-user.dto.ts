import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'INVALID_EMAIL' })
  @IsNotEmpty({ message: 'EMAIL_REQUIRED' })
  email: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString({ message: 'NAME_MUST_BE_STRING' })
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString({ message: 'PASSWORD_MUST_BE_STRING' })
  @IsNotEmpty({ message: 'PASSWORD_REQUIRED' })
  @MinLength(6, { message: 'PASSWORD_TOO_SHORT' })
  password: string;
}
