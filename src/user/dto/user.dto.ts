import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UpdateUserDto {
  @Expose()
  @ApiProperty({
    example: '대파',
    description: '유저 이름',
    required: false,
  })
  name?: string;

  @Expose()
  @ApiProperty({
    example: '123',
    description: '유저 이미지',
    required: false,
  })
  profile_image?: string;
}
