import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiNotificationListGetResponseDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '알림 id',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: 'ce9cee6288595607bb2720aa685d8f89',
    description: '알림 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '유승모님이 회원님의 게시물을 좋아합니다.',
    description: '알림 내용',
  })
  content: string;

  @Expose()
  @ApiProperty({
    example: '6e6df92a8af35a16af80c358d73d54bb',
    description: '커뮤니티 uuid',
  })
  target_uuid: string;

  @Expose()
  @ApiProperty({
    example: '6e6df92a8af35a16af80c358d73d54bb',
    description: '좋아요한 유저 uuid',
  })
  user_uuid: string;

  @Expose()
  @ApiProperty({
    example:
      'https://lh3.googleusercontent.com/a/ACg8ocKAb6iB4pEMNzQ-IjQJHMEvhxKC8tDHn5VL0FIlDK2v=s96-c',
    description: '좋아요한 유저 썸네일',
  })
  user_thumbnail: string;

  @Expose()
  @ApiProperty({
    example: '2023-10-21 00:00:00',
    description: '읽은 날짜',
  })
  reat_at: Date;

  @Expose()
  @ApiProperty({
    example: '2023-10-21 00:00:00',
    description: '생성 일자',
  })
  created_at: Date;
}
