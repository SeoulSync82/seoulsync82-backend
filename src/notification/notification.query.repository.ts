import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/entities/notification.entity';
import { ApiNotificationGetListRequestQueryDto } from 'src/notification/dto/api-notification-get-list-request-query.dto';
import { LessThan, Repository } from 'typeorm';

export class NotificationQueryRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private repository: Repository<NotificationEntity>,
  ) {}

  async sendNotification(notificationData): Promise<NotificationEntity> {
    return this.repository.save(notificationData);
  }

  async findList(dto: ApiNotificationGetListRequestQueryDto, user): Promise<NotificationEntity[]> {
    const whereConditions = { target_user_uuid: user.uuid };

    if (dto.last_id > 0) {
      Object.assign(whereConditions, { id: LessThan(dto.last_id) });
    }

    return this.repository.find({
      where: whereConditions,
      order: { created_at: 'DESC' },
      take: dto.size,
    });
  }

  async findNotification(uuid): Promise<NotificationEntity> {
    return this.repository.findOne({
      where: { uuid },
    });
  }

  async updateRead(uuid) {
    return this.repository.update(
      {
        uuid,
      },
      { read_at: new Date() },
    );
  }
}
