import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CommunityNotificationDetailDto {
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
    example: 'target-uuid',
    description: '대상 커뮤니티 UUID',
  })
  target_uuid: string;

  @Expose()
  @ApiProperty({
    example: 'target-user-uuid',
    description: '대상 사용자 UUID',
  })
  target_user_uuid: string;

  @Expose()
  @ApiProperty({
    example: '회원님의 게시물을 JohnDoe님이 좋아합니다.',
    description: 'Notification 메시지',
  })
  content: string;
}
