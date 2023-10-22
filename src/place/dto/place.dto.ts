import { ApiProperty } from '@nestjs/swagger';

export class PlaceReadDto {
  @ApiProperty({
    example: 0,
    description: '마지막 장소 아이디',
    required: false,
  })
  last_id?: number;

  @ApiProperty({
    example: 10,
    description: '한 번에 보여줄 장소 개수',
    required: false,
  })
  size?: number;
}
