import { ApiProperty } from '@nestjs/swagger';

export class CursorPaginationMetaDto {
  @ApiProperty({
    description: 'Cursor for the next page (ID of last item)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty({
    description: 'Whether there are more items available',
    example: true,
  })
  hasMore: boolean;

  @ApiProperty({
    description: 'Number of items returned in this response',
    example: 10,
  })
  count: number;

  @ApiProperty({
    description: 'Number of items requested',
    example: 10,
  })
  limit: number;
}

export class CursorPaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Cursor pagination metadata',
    type: CursorPaginationMetaDto,
  })
  meta: CursorPaginationMetaDto;

  constructor(
    data: T[],
    hasMore: boolean,
    limit: number,
    getIdFn: (item: T) => string
  ) {
    this.data = data;
    this.meta = {
      nextCursor:
        data.length > 0 && hasMore ? getIdFn(data[data.length - 1]) : null,
      hasMore,
      count: data.length,
      limit,
    };
  }
}
