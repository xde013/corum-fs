import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteUsersDto {
  @ApiProperty({
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    ],
    description: 'Array of user UUIDs to delete',
    type: [String],
  })
  ids: string[];
}

