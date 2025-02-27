import { ApiProperty } from '@nestjs/swagger';

export class ListResponseDto<T> {
  @ApiProperty({
    description: 'List of items',
    isArray: true,
  })
  items: T[];
}
