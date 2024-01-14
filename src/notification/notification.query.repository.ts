import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/entities/notification.entity';
import { LessThan, Repository } from 'typeorm';
import { ApiNotificationListGetRequestQueryDto } from './dto/api-notification-list-get-request-query.dto';

export class NotificationQueryRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private repository: Repository<NotificationEntity>,
  ) {}

  async sendNotification(notificationData): Promise<NotificationEntity> {
    return await this.repository.save(notificationData);
  }

  async findList(dto: ApiNotificationListGetRequestQueryDto, user): Promise<NotificationEntity[]> {
    const whereConditions = { target_user_uuid: user.uuid };

    if (dto.last_id > 0) {
      Object.assign(whereConditions, { id: LessThan(dto.last_id) });
    }

    return await this.repository.find({
      where: whereConditions,
      order: { created_at: 'DESC' },
      take: dto.size,
    });
  }

  async findNotification(uuid): Promise<NotificationEntity> {
    return await this.repository.findOne({
      where: { uuid: uuid },
    });
  }

  async updateRead(uuid) {
    return await this.repository.update(
      {
        uuid: uuid,
      },
      { read_at: new Date() },
    );
  }
}
