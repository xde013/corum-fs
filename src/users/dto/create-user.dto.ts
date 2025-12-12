import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
  })
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'The password for the user account',
  })
  password: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'The birthdate of the user',
    type: String,
    format: 'date',
  })
  birthdate: Date;
}
