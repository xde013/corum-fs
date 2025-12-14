import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
} from 'class-validator';

// Password validation constants
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const PASSWORD_MESSAGE =
  'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';

/**
 * Base DTO for email field
 * Used across multiple auth DTOs to maintain consistency
 */
export class EmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

/**
 * Base DTO for password field with validation
 * Used across multiple auth DTOs to maintain consistency
 *
 * Requirements:
 * - Minimum 8 characters
 * - Maximum 128 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 */
export class PasswordDto {
  @ApiProperty({
    example: 'Password123!',
    description: `Password (${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} chars, must contain uppercase, lowercase, number, and special character)`,
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_PATTERN, {
    message: PASSWORD_MESSAGE,
  })
  password: string;
}

/**
 * Base DTO for reset token
 */
export class ResetTokenDto {
  @ApiProperty({
    example: 'reset-token-here',
    description: 'Password reset token received via email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

/**
 * Base DTO for new password (used in reset password flow)
 * Reuses the same validation rules as PasswordDto but with different field name
 */
export class NewPasswordDto {
  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: `New password (${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} chars, must contain uppercase, lowercase, number, and special character)`,
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_PATTERN, {
    message: PASSWORD_MESSAGE,
  })
  newPassword: string;
}

/**
 * Base DTO for name fields
 */
export class NameDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;
}

/**
 * Base DTO for birthdate field
 */
export class BirthdateDto {
  @ApiProperty({
    example: '1990-01-01',
    description: 'User birthdate',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  birthdate: string;
}
