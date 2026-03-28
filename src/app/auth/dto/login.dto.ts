import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'INVALID_EMAIL' })
  @IsNotEmpty({ message: 'EMAIL_REQUIRED' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: 'PASSWORD_MUST_BE_STRING' })
  @IsNotEmpty({ message: 'PASSWORD_REQUIRED' })
  @MinLength(6, { message: 'PASSWORD_TOO_SHORT' })
  password: string;
}
