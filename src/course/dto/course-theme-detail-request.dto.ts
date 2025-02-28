import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CourseThemeDetailRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '테마 uuid',
  })
  uuid: string;

  @ApiProperty({
    example: '가성비 좋은 💸',
    description: '테마 이름',
  })
  theme: string;
}
