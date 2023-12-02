import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { NotificationListResDto } from './dto/notification.dto';
import { NotificationQueryRepository } from './notification.query.repository';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationQueryRepository: NotificationQueryRepository) {}

  async notificationList(dto, user) {
    const notificationList = await this.notificationQueryRepository.findList(dto, user);
    if (notificationList.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const notificationListResDto = plainToInstance(NotificationListResDto, notificationList, {
      excludeExtraneousValues: true,
    });

    const last_item_id =
      notificationList.length > 0 ? notificationList[notificationList.length - 1].id : 0;

    return ResponseDataDto.from(notificationListResDto, null, last_item_id);
  }

  async notificationRead(uuid, user) {
    const notification = await this.notificationQueryRepository.findNotification(uuid);
    if (!notification || notification.target_user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    await this.notificationQueryRepository.updateRead(uuid);

    return DetailResponseDto.uuid(uuid);
  }
}
