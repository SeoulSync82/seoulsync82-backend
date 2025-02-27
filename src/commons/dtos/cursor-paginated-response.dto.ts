import { ApiProperty } from '@nestjs/swagger';

export class CursorPaginatedResponseDto<T> {
  @ApiProperty({
    description: 'List of items',
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    example: 'encryptedCursorString123',
    description: 'Next page encrypted cursor',
  })
  next_page: string;

  @ApiProperty({
    description: 'Total count of items',
    example: 100,
    required: false,
  })
  total_count?: number;
}
