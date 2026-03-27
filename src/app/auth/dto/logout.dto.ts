import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ description: 'The refresh token of the user', required: false })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
