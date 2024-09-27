import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiCoursePostSaveResponseDto {
  @Expose()
  @ApiProperty({
    example: 'f8af50f3b7aa4125872029a0ef9fbdc3',
    description: '코스 uuid',
  })
  uuid: string;
}
