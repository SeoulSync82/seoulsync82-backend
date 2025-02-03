import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class ApiPlaceGetCultureRequestQueryDto {
  @IsNotEmpty()
  @IsInt()
  @Min(5)
  @Max(50)
  @ApiProperty({
    example: 10,
    description: '한 번에 보여질 전시/팝업 수',
  })
  size: number;
}
