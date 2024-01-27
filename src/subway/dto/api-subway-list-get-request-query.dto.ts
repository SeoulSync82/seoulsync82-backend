import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApiCourseSubwayListGetRequestQueryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '지하철 호선 uuid',
  })
  line_uuid: string;
}
