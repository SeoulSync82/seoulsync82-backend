import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { ApiNotificationListGetRequestQueryDto } from './dto/api-notification-list-get-request-query.dto';
import { ApiNotificationListGetResponseDto } from './dto/api-notification-list-get-response.dto';
import { NotificationQueryRepository } from './notification.query.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationQueryRepository: NotificationQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async notificationList(dto: ApiNotificationListGetRequestQueryDto, user) {
    const notificationList = await this.notificationQueryRepository.findList(dto, user);
    if (notificationList.length === 0) {
      return { items: [] };
    }

    const userList = await this.userQueryRepository.findUserList(
      notificationList.map((item) => item.user_uuid),
    );

    const apiNotificationListGetResponseDto = plainToInstance(
      ApiNotificationListGetResponseDto,
      notificationList,
      {
        excludeExtraneousValues: true,
      },
    ).map((notification) => {
      notification.user_thumbnail = userList.find(
        (item) => item.uuid === notification.user_uuid,
      ).profile_image;
      return notification;
    });

    const last_item_id =
      notificationList.length === dto.size ? notificationList[notificationList.length - 1].id : 0;

    return { items: apiNotificationListGetResponseDto, last_item_id };
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
