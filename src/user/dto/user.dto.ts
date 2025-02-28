import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  @ApiProperty({
    example: '833ddf7de19d5bf998bb1e20f274eba0',
    description: 'uuid',
    required: false,
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '야오밍',
    description: 'nickname',
    required: false,
  })
  nickname: string;

  @Expose()
  @ApiProperty({
    example: '',
    description: 'profile image url ',
    required: false,
  })
  profile_image: string;
}
