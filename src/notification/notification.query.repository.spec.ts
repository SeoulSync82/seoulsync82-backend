import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/entities/notification.entity';
import { ApiNotificationGetListRequestQueryDto } from 'src/notification/dto/api-notification-get-list-request-query.dto';
import { NotificationQueryRepository } from 'src/notification/notification.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { LessThan, Repository, UpdateResult } from 'typeorm';

describe('NotificationQueryRepository', () => {
  let notificationQueryRepository: NotificationQueryRepository;
  let repository: jest.Mocked<Repository<NotificationEntity>>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(NotificationQueryRepository).compile();
    notificationQueryRepository = unit;
    repository = unitRef.get(getRepositoryToken(NotificationEntity) as string);
    jest.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('should save and return notification entity when valid notificationData provided', async () => {
      // Given
      const notificationData = {
        uuid: 'noti-1',
        target_user_uuid: 'user-1',
        content: '테스트 알림',
      } as NotificationEntity;
      const savedNotification = { ...notificationData, id: 1 };
      jest.spyOn(repository, 'save').mockResolvedValue(savedNotification);

      // When
      const result = await notificationQueryRepository.sendNotification(notificationData);

      // Then
      expect(repository.save).toHaveBeenCalledWith(notificationData);
      expect(result).toEqual(savedNotification);
    });
  });

  describe('findList', () => {
    it('should return notifications with LessThan condition when last_id > 0', async () => {
      // Given
      const dto = { size: 5, last_id: 10 } as ApiNotificationGetListRequestQueryDto;
      const user = { uuid: 'user-1' } as UserDto;
      const expectedWhere = {
        target_user_uuid: user.uuid,
        id: LessThan(dto.last_id),
      };
      const notifications: NotificationEntity[] = [
        {
          id: 9,
          uuid: 'noti-9',
          target_user_uuid: user.uuid,
          content: '알림 테스트',
          created_at: new Date(),
        } as NotificationEntity,
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(notifications);

      // When
      const result = await notificationQueryRepository.findList(dto, user);

      // Then
      expect(repository.find).toHaveBeenCalledWith({
        where: expectedWhere,
        order: { created_at: 'DESC' },
        take: dto.size,
      });
      expect(result).toEqual(notifications);
    });

    it('should return notifications without LessThan condition when last_id <= 0', async () => {
      // Given
      const dto = { size: 5, last_id: 0 } as ApiNotificationGetListRequestQueryDto;
      const user = { uuid: 'user-1' } as UserDto;
      const expectedWhere = { target_user_uuid: user.uuid };
      const notifications: NotificationEntity[] = [
        {
          id: 5,
          uuid: 'noti-5',
          target_user_uuid: user.uuid,
          content: '알림 테스트',
          created_at: new Date(),
        } as NotificationEntity,
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(notifications);

      // When
      const result = await notificationQueryRepository.findList(dto, user);

      // Then
      expect(repository.find).toHaveBeenCalledWith({
        where: expectedWhere,
        order: { created_at: 'DESC' },
        take: dto.size,
      });
      expect(result).toEqual(notifications);
    });
  });

  describe('findNotification', () => {
    it('should return notification entity when found by uuid', async () => {
      // Given
      const uuid = 'noti-1';
      const notification: NotificationEntity = {
        id: 1,
        uuid,
        target_user_uuid: 'user-1',
        content: '알림 테스트',
        created_at: new Date(),
      } as NotificationEntity;
      jest.spyOn(repository, 'findOne').mockResolvedValue(notification);

      // When
      const result = await notificationQueryRepository.findNotification(uuid);

      // Then
      expect(repository.findOne).toHaveBeenCalledWith({ where: { uuid } });
      expect(result).toEqual(notification);
    });
  });

  describe('updateRead', () => {
    it('should update read_at field and return UpdateResult when valid uuid provided', async () => {
      // Given
      const uuid = 'noti-1';
      const updateResult: UpdateResult = {
        affected: 1,
        raw: [],
        generatedMaps: [],
      };
      jest.spyOn(repository, 'update').mockResolvedValue(updateResult);

      // When
      const result = await notificationQueryRepository.updateRead(uuid);

      // Then
      expect(repository.update).toHaveBeenCalledWith({ uuid }, { read_at: expect.any(Date) });
      expect(result).toEqual(updateResult);
    });
  });
});
