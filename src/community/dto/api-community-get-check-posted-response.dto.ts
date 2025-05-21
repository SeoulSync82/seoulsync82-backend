import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiCommunityGetCheckPostedResponseDto {
  @Expose()
  @ApiProperty({
    example: false,
    description: '이미 작성된 글인지 체크',
  })
  is_posted: boolean;
}
