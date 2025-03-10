import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/entities/notification.entity';
import { ApiNotificationGetListRequestQueryDto } from 'src/notification/dto/api-notification-get-list-request-query.dto';
import { NotificationPushDto } from 'src/notification/dto/notification.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { LessThan, Repository, UpdateResult } from 'typeorm';

export class NotificationQueryRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private repository: Repository<NotificationEntity>,
  ) {}

  async sendNotification(notificationData: NotificationPushDto): Promise<NotificationEntity> {
    return this.repository.save(notificationData);
  }

  async findList(
    dto: ApiNotificationGetListRequestQueryDto,
    user: UserDto,
  ): Promise<NotificationEntity[]> {
    const whereConditions = {
      target_user_uuid: user.uuid,
      ...(dto.last_id > 0 ? { id: LessThan(dto.last_id) } : {}),
    };

    return this.repository.find({
      where: whereConditions,
      order: { created_at: 'DESC' },
      take: dto.size,
    });
  }

  async findNotification(uuid: string): Promise<NotificationEntity> {
    return this.repository.findOne({
      where: { uuid },
    });
  }

  async updateRead(uuid: string): Promise<UpdateResult> {
    return this.repository.update(
      {
        uuid,
      },
      { read_at: new Date() },
    );
  }
}
