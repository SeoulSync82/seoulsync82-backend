import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApiCourseSubwayListGetRequestQueryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '2호선',
    description: '지하철 호선',
  })
  line: string;
}
