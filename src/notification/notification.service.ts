import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/commons/constants/error';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { ApiNotificationGetListRequestQueryDto } from './dto/api-notification-get-list-request-query.dto';
import { ApiNotificationGetListResponseDto } from './dto/api-notification-get-list-response.dto';
import { NotificationQueryRepository } from './notification.query.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationQueryRepository: NotificationQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async notificationList(dto: ApiNotificationGetListRequestQueryDto, user: UserDto) {
    const notificationList = await this.notificationQueryRepository.findList(dto, user);
    if (notificationList.length === 0) {
      return { items: [] };
    }

    const userList = await this.userQueryRepository.findUserList(
      notificationList.map((item) => item.user_uuid),
    );

    const apiNotificationListGetResponseDto = plainToInstance(
      ApiNotificationGetListResponseDto,
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

  async notificationRead(uuid, user: UserDto) {
    const notification = await this.notificationQueryRepository.findNotification(uuid);
    if (!notification || notification.target_user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    await this.notificationQueryRepository.updateRead(uuid);

    return DetailResponseDto.uuid(uuid);
  }
}
