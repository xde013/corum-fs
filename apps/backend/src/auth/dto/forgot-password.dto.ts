import { PickType } from '@nestjs/swagger';
import { EmailDto } from './base.dto';

/**
 * Forgot Password DTO
 * Reuses EmailDto to maintain consistency
 */
export class ForgotPasswordDto extends PickType(EmailDto, ['email'] as const) {}
