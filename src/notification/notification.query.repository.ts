import { InjectRepository } from '@nestjs/typeorm';
import { MyCourseEntity } from 'src/entities/my_course.entity';
import { NotificationEntity } from 'src/entities/notification.entity';
import { IsNull, LessThan, Repository, In } from 'typeorm';

export class NotificationQueryRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private repository: Repository<NotificationEntity>,
  ) {}
}
