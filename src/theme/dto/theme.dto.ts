import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ThemeListDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '테마 id',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '테마 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '가성비 좋은💸',
    description: '테마 이름',
  })
  theme_name: string;

  @Expose()
  @ApiProperty({
    example: '음식점',
    description: '테마 타입',
  })
  theme_type: string;
}
