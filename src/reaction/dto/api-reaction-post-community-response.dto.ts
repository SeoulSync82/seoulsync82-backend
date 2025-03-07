import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ReactionNotificationDetailDto } from 'src/reaction/dto/reaction-notification-detail.dto';

export class ApiReactionPostCommunityResponseDto {
  @Expose()
  @ApiProperty({
    description: '반응 작업 결과 데이터',
    example: { uuid: 'result-uuid' },
  })
  data: {
    uuid: string;
  };

  @Expose()
  @ApiProperty({
    description: '생성된 Notification 정보 (선택적)',
    type: ReactionNotificationDetailDto,
    nullable: true,
  })
  notification?: ReactionNotificationDetailDto;
}
