import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApiSubwayGetCheckRequestQueryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '성수',
    description: '지하철 역',
  })
  subway: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '2호선',
    description: '지하철 호선',
  })
  line: string;
}
