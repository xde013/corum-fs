import { IntersectionType } from '@nestjs/swagger';
import { EmailDto, PasswordDto, NameDto, BirthdateDto } from './base.dto';

export class RegisterDto extends IntersectionType(
  NameDto,
  EmailDto,
  PasswordDto,
  BirthdateDto
) {}
