import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiUserGetTokenResponseDto {
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
  nickname: string;

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
    example: 'eyc12e0h1208....',
    description: '유저 엑세스 토큰',
    required: false,
  })
  access_token: string;
}
