import { IntersectionType } from '@nestjs/swagger';
import { EmailDto, PasswordDto } from './base.dto';

export class LoginDto extends IntersectionType(EmailDto, PasswordDto) {}
