import { PartialType } from '@nestjs/swagger';
import { CreateReverseDto } from './create-reverse.dto';

export class UpdateReverseDto extends PartialType(CreateReverseDto) {}
