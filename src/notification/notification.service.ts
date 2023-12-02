import { Injectable } from '@nestjs/common';
import { NotificationQueryRepository } from './notification.query.repository';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationQueryRepository: NotificationQueryRepository) {}
}
