import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class NotificationPushDto {
  constructor(props) {
    this.uuid = props.uuid;
    this.user_uuid = props.user_uuid;
    this.target_type = props.target_type;
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
    example: 'reaction',
    description: '타켓 type',
  })
  target_type: string;

  @Expose()
  @ApiProperty({
    example: '6e6df92a8af35a16af80c358d73d54bb',
    description: '타켓 uuid',
  })
  target_uuid: string;

  @Expose()
  @ApiProperty({
    example: '2871948cc25b589ea0a672a6f060fae3',
    description: '타켓 유저 uuid',
  })
  target_user_uuid: string;

  @Expose()
  @ApiProperty({
    example: '유승모님이 회원님의 게시물을 좋아합니다.',
    description: '알림 내용',
  })
  content: string;
}
