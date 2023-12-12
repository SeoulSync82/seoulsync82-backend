import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class NotificationPushDto {
  constructor(props) {
    this.uuid = props.uuid;
    this.user_uuid = props.user_uuid;
    this.target_uuid = props.target_uuid;
    this.target_user_uuid = props.target_user_uuid;
    this.content = props.content;
  }

  @Expose()
  @ApiProperty({
    example: 'a98afhhasf08hf0s8hf',
    description: '알림 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '2871948cc25b589ea0a672a6f060fae3',
    description: '유저 uuid',
  })
  user_uuid: string;

  @Expose()
  @ApiProperty({
    example: '6e6df92a8af35a16af80c358d73d54bb',
    description: '커뮤니티 uuid',
  })
  target_uuid: string;

  @Expose()
  @ApiProperty({
    example: '2871948cc25b589ea0a672a6f060fae3',
    description: '유저 uuid',
  })
  target_user_uuid: string;

  @Expose()
  @ApiProperty({
    example: '유승모님이 회원님의 게시물을 좋아합니다.',
    description: '알림 내용',
  })
  content: string;
}

export class NotificationListReqDto {
  @Expose()
  @ApiProperty({
    example: 0,
    description: '마지막 내코스 아이디',
    required: false,
  })
  last_id?: number;

  @Expose()
  @ApiProperty({
    example: 10,
    description: '한 번에 보여줄 내코스 개수',
    required: false,
  })
  size?: number;
}

export class NotificationListResDto {
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
