import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserFiltersDto {
  @ApiProperty({
    description: 'Filter by first name (partial match, case-insensitive)',
    required: false,
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Filter by last name (partial match, case-insensitive)',
    required: false,
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Filter by email (partial match, case-insensitive)',
    required: false,
    example: 'example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;
}
