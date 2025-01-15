import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiCoursePostSaveResponseDto {
  @Expose()
  @ApiProperty({
    example: '00145054384a4b0d85b4198c6e54404f',
    description: '코스 uuid',
  })
  uuid: string;
}
