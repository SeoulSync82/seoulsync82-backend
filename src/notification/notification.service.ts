import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/commons/constants/error';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { ApiNotificationGetListRequestQueryDto } from 'src/notification/dto/api-notification-get-list-request-query.dto';
import { ApiNotificationGetListResponseDto } from 'src/notification/dto/api-notification-get-list-response.dto';
import { NotificationQueryRepository } from 'src/notification/notification.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationQueryRepository: NotificationQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async notificationList(
    dto: ApiNotificationGetListRequestQueryDto,
    user: UserDto,
  ): Promise<LastItemIdResponseDto<ApiNotificationGetListResponseDto>> {
    const notificationList = await this.notificationQueryRepository.findList(dto, user);
    if (notificationList.length === 0) {
      return { items: [], last_item_id: 0 };
    }

    const userList = await this.userQueryRepository.findUserList(
      notificationList.map((item) => item.user_uuid),
    );

    const lastItemId =
      notificationList.length === dto.size ? notificationList[notificationList.length - 1].id : 0;

    return {
      items: plainToInstance(ApiNotificationGetListResponseDto, notificationList, {
        excludeExtraneousValues: true,
      }).map((notification) => ({
        ...notification,
        user_thumbnail: userList.find((item) => item.uuid === notification.user_uuid).profile_image,
      })),
      last_item_id: lastItemId,
    };
  }

  async notificationRead(uuid: string, user: UserDto): Promise<UuidResponseDto> {
    const notification = await this.notificationQueryRepository.findNotification(uuid);
    if (!notification || notification.target_user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    await this.notificationQueryRepository.updateRead(uuid);

    return { uuid };
  }
}
