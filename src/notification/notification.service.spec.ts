import { TestBed } from '@automock/jest';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { NotificationEntity } from 'src/entities/notification.entity';
import { UserEntity } from 'src/entities/user.entity';
import { ApiNotificationGetListRequestQueryDto } from 'src/notification/dto/api-notification-get-list-request-query.dto';
import { ApiNotificationGetListResponseDto } from 'src/notification/dto/api-notification-get-list-response.dto';
import { NotificationQueryRepository } from 'src/notification/notification.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let notificationQueryRepository: jest.Mocked<NotificationQueryRepository>;
  let userQueryRepository: jest.Mocked<UserQueryRepository>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(NotificationService).compile();
    notificationService = unit;
    notificationQueryRepository = unitRef.get(NotificationQueryRepository);
    userQueryRepository = unitRef.get(UserQueryRepository);
    jest.clearAllMocks();
  });

  const sampleNotifications = [
    { id: 1, user_uuid: 'user-1', content: '알림 내용 1' },
    { id: 2, user_uuid: 'user-2', content: '알림 내용 2' },
  ] as NotificationEntity[];
  const sampleUsers = [
    { uuid: 'user-1', profile_image: 'img1.jpg' },
    { uuid: 'user-2', profile_image: 'img2.jpg' },
  ] as UserEntity[];

  describe('notificationList', () => {
    it('should return empty list when no notifications found', async () => {
      // Given
      const dto = { size: 10 } as ApiNotificationGetListRequestQueryDto;
      const user = { uuid: 'user-1' } as UserDto;
      jest.spyOn(notificationQueryRepository, 'findList').mockResolvedValue([]);

      // When
      const result = await notificationService.notificationList(dto, user);

      // Then
      expect(result).toEqual({ items: [], last_item_id: 0 });
      expect(notificationQueryRepository.findList).toHaveBeenCalledWith(dto, user);
    });

    it('should return notification list with last_item_id when list length equals dto.size', async () => {
      // Given
      const dto = { size: 2 } as ApiNotificationGetListRequestQueryDto;
      const user = { uuid: 'user-1' } as UserDto;
      jest.spyOn(notificationQueryRepository, 'findList').mockResolvedValue(sampleNotifications);
      jest.spyOn(userQueryRepository, 'findUserList').mockResolvedValue(sampleUsers);

      // When
      const result = await notificationService.notificationList(dto, user);

      // Then
      const expectedItems = plainToInstance(
        ApiNotificationGetListResponseDto,
        sampleNotifications,
        {
          excludeExtraneousValues: true,
        },
      ).map((notification) => ({
        ...notification,
        user_thumbnail: sampleUsers.find((item) => item.uuid === notification.user_uuid)
          .profile_image,
      }));
      expect(result).toEqual({
        items: expectedItems,
        last_item_id: sampleNotifications[sampleNotifications.length - 1].id,
      });
      expect(notificationQueryRepository.findList).toHaveBeenCalledWith(dto, user);
      expect(userQueryRepository.findUserList).toHaveBeenCalledWith(
        sampleNotifications.map((n) => n.user_uuid),
      );
    });

    it('should return notification list with last_item_id 0 when list length does not equal dto.size', async () => {
      // Given
      const dto = { size: 5 } as ApiNotificationGetListRequestQueryDto;
      const user = { uuid: 'user-1' } as UserDto;
      jest.spyOn(notificationQueryRepository, 'findList').mockResolvedValue(sampleNotifications);
      jest.spyOn(userQueryRepository, 'findUserList').mockResolvedValue(sampleUsers);

      // When
      const result = await notificationService.notificationList(dto, user);

      // Then
      const expectedItems = plainToInstance(
        ApiNotificationGetListResponseDto,
        sampleNotifications,
        {
          excludeExtraneousValues: true,
        },
      ).map((notification) => ({
        ...notification,
        user_thumbnail: sampleUsers.find((item) => item.uuid === notification.user_uuid)
          .profile_image,
      }));
      expect(result).toEqual({
        items: expectedItems,
        last_item_id: 0,
      });
      expect(notificationQueryRepository.findList).toHaveBeenCalledWith(dto, user);
      expect(userQueryRepository.findUserList).toHaveBeenCalledWith(
        sampleNotifications.map((n) => n.user_uuid),
      );
    });
  });

  describe('notificationRead', () => {
    it('should mark notification as read and return uuid when notification exists and belongs to user', async () => {
      // Given
      const uuid = 'noti-1';
      const user = { uuid: 'user-1' } as UserDto;
      const sampleNotification = { uuid, target_user_uuid: 'user-1' } as NotificationEntity;
      jest
        .spyOn(notificationQueryRepository, 'findNotification')
        .mockResolvedValue(sampleNotification);
      jest.spyOn(notificationQueryRepository, 'updateRead').mockResolvedValue(undefined);

      // When
      const result = await notificationService.notificationRead(uuid, user);

      // Then
      expect(result).toEqual({ uuid });
      expect(notificationQueryRepository.findNotification).toHaveBeenCalledWith(uuid);
      expect(notificationQueryRepository.updateRead).toHaveBeenCalledWith(uuid);
    });

    it('should throw NotFoundException when notification does not exist', async () => {
      // Given
      const uuid = 'noti-1';
      const user = { uuid: 'user-1' } as UserDto;
      jest.spyOn(notificationQueryRepository, 'findNotification').mockResolvedValue(null);

      // When & Then
      await expect(notificationService.notificationRead(uuid, user)).rejects.toThrow(
        NotFoundException,
      );
      expect(notificationQueryRepository.findNotification).toHaveBeenCalledWith(uuid);
    });

    it('should throw NotFoundException when notification does not belong to user', async () => {
      // Given
      const uuid = 'noti-1';
      const user = { uuid: 'user-1' } as UserDto;
      const sampleNotification = { uuid, target_user_uuid: 'user-2' } as NotificationEntity;
      jest
        .spyOn(notificationQueryRepository, 'findNotification')
        .mockResolvedValue(sampleNotification);

      // When & Then
      await expect(notificationService.notificationRead(uuid, user)).rejects.toThrow(
        NotFoundException,
      );
      expect(notificationQueryRepository.findNotification).toHaveBeenCalledWith(uuid);
    });
  });
});
