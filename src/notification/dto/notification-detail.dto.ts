import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class NotificationDetailDto {
  @Expose()
  @ApiProperty({
    example: 'generated-uuid',
    description: 'Notification UUID',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: 'user-uuid',
    description: 'Notification 생성자 UUID',
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
    example: 'target-uuid',
    description: '타켓 UUID',
  })
  target_uuid: string;

  @Expose()
  @ApiProperty({
    example: 'target-user-uuid',
    description: '타켓 사용자 UUID',
  })
  target_user_uuid: string;

  @Expose()
  @ApiProperty({
    example: '회원님의 게시물을 승모님이 좋아합니다.',
    description: 'Notification 메시지',
  })
  content: string;
}
