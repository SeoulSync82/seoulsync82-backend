import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiUserGetProfileResponseDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '유저 id',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: '2871948cc25b589ea0a672a6f060fae3',
    description: '유저 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '유승모',
    description: '유저 이름',
    required: false,
  })
  name: string;

  @Expose()
  @ApiProperty({
    example:
      'https://lh3.googleusercontent.com/a/ACg8ocKAb6iB4pEMNzQ-IjQJHMEvhxKC8tDHn5VL0FIlDK2v=s96-c',
    description: '유저 이미지',
    required: false,
  })
  profile_image: string;

  @Expose()
  @ApiProperty({
    example: 'topblade6@gmail.com',
    description: '유저 이메일',
  })
  email: string;

  @Expose()
  @ApiProperty({
    example: '2023-10-21 00:00:00',
    description: '생성일',
  })
  created_at: Date;
}
