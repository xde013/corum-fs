import { IntersectionType } from '@nestjs/swagger';
import { ResetTokenDto, NewPasswordDto } from './base.dto';

/**
 * Combines ResetTokenDto with NewPasswordDto
 */
export class ResetPasswordDto extends IntersectionType(
  ResetTokenDto,
  NewPasswordDto
) {}
