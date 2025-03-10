import { TestBed } from '@automock/jest';
import { NotFoundException } from '@nestjs/common';
import { ERROR } from 'src/commons/constants/error';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { ApiNotificationGetListRequestQueryDto } from 'src/notification/dto/api-notification-get-list-request-query.dto';
import { ApiNotificationGetListResponseDto } from 'src/notification/dto/api-notification-get-list-response.dto';
import { NotificationService } from 'src/notification/notification.service';
import { UserDto } from 'src/user/dto/user.dto';
import { NotificationController } from './notification.controller';

describe('NotificationController', () => {
  let notificationController: NotificationController;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(NotificationController).compile();
    notificationController = unit;
    notificationService = unitRef.get(NotificationService);
    jest.clearAllMocks();
  });

  describe('notificationList', () => {
    it('should return notification list when valid dto and user provided', async () => {
      // Given
      const dto = { size: 10, last_id: 0 } as ApiNotificationGetListRequestQueryDto;
      const user = { uuid: 'user-1' } as UserDto;
      const sampleResponse: LastItemIdResponseDto<ApiNotificationGetListResponseDto> = {
        items: [{ uuid: 'noti-1', content: '알림 내용' } as ApiNotificationGetListResponseDto],
        last_item_id: 1,
      };
      jest.spyOn(notificationService, 'notificationList').mockResolvedValue(sampleResponse);

      // When
      const result = await notificationController.notificationList(dto, user);

      // Then
      expect(notificationService.notificationList).toHaveBeenCalledWith(dto, user);
      expect(result).toEqual(sampleResponse);
    });
  });

  describe('notificationRead', () => {
    it('should return uuid response when valid uuid and user provided', async () => {
      // Given
      const uuid = 'noti-1';
      const user = { uuid: 'user-1' } as UserDto;
      const sampleResponse: UuidResponseDto = { uuid };
      jest.spyOn(notificationService, 'notificationRead').mockResolvedValue(sampleResponse);

      // When
      const result = await notificationController.notificationRead(uuid, user);

      // Then
      expect(notificationService.notificationRead).toHaveBeenCalledWith(uuid, user);
      expect(result).toEqual(sampleResponse);
    });

    it('should throw NotFoundException when service throws NotFoundException', async () => {
      // Given
      const uuid = 'noti-1';
      const user = { uuid: 'user-1' } as UserDto;
      jest
        .spyOn(notificationService, 'notificationRead')
        .mockRejectedValue(new NotFoundException(ERROR.NOT_EXIST_DATA));

      // When & Then
      await expect(notificationController.notificationRead(uuid, user)).rejects.toThrow(
        NotFoundException,
      );
      expect(notificationService.notificationRead).toHaveBeenCalledWith(uuid, user);
    });
  });
});
