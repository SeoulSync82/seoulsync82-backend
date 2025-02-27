import { ApiProperty } from '@nestjs/swagger';

export class LastItemIdResponseDto<T> {
  @ApiProperty({
    description: 'List of items',
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    example: '3',
    description: 'last_item_id',
  })
  last_item_id: number;
}
