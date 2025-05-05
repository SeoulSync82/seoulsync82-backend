import { TestBed } from '@automock/jest';
import { NotFoundException } from '@nestjs/common';
import * as classTransformer from 'class-transformer';
import { ERROR } from 'src/commons/constants/error';
import * as generateUUID from 'src/commons/util/uuid';
import { NoticeEntity } from 'src/entities/notice.entity';
import { ApiNoticeGetDetailResponseDto } from 'src/notice/dto/api-notice-get-detail-response.dto';
import { ApiNoticeGetRequestQueryDto } from 'src/notice/dto/api-notice-get-request-query.dto';
import { ApiNoticeGetResponseDto } from 'src/notice/dto/api-notice-get-response.dto';
import { ApiNoticePostRequestBodyDto } from 'src/notice/dto/api-notice-post-request-body.dto';
import { ApiNoticePutRequestBodyDto } from 'src/notice/dto/api-notice-put-request-body.dto';
import { NoticeQueryRepository } from 'src/notice/notice.query.repository';
import { NoticeService } from 'src/notice/notice.service';

describe('NoticeService', () => {
  let noticeService: NoticeService;
  let noticeQueryRepository: jest.Mocked<NoticeQueryRepository>;

  beforeEach(() => {
    // Given
    const { unit, unitRef } = TestBed.create(NoticeService).compile();
    noticeService = unit;
    noticeQueryRepository = unitRef.get(NoticeQueryRepository);
    jest.clearAllMocks();
  });

  describe('createNotice', () => {
    it('should return uuid when dto is valid', async () => {
      // Given
      const dto: ApiNoticePostRequestBodyDto = {
        title: 't',
        content: 'c',
        published_at: new Date(),
      };
      jest.spyOn(generateUUID, 'generateUUID').mockReturnValue('generated-uuid');
      noticeQueryRepository.save.mockResolvedValue(undefined as unknown as NoticeEntity);
      // When
      const result = await noticeService.createNotice(dto);
      // Then
      expect(generateUUID.generateUUID).toHaveBeenCalled();
      expect(noticeQueryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: 'generated-uuid', title: 't' }),
      );
      expect(result).toEqual({ uuid: 'generated-uuid' });
    });
  });

  describe('getNoticeDetail', () => {
    it('should return detail dto when uuid exists', async () => {
      // Given
      const entity = { uuid: 'id', title: 't' } as NoticeEntity;
      noticeQueryRepository.findOne.mockResolvedValue(entity);
      jest
        .spyOn(classTransformer, 'plainToInstance')
        .mockReturnValue(entity as unknown as ApiNoticeGetDetailResponseDto);
      // When
      const result = await noticeService.getNoticeDetail('id');
      // Then
      expect(noticeQueryRepository.findOne).toHaveBeenCalledWith('id');
      expect(classTransformer.plainToInstance).toHaveBeenCalled();
      expect(result).toEqual(entity);
    });

    it('should throw NotFoundException when uuid does not exist', async () => {
      // Given
      noticeQueryRepository.findOne.mockResolvedValue(null);
      // When & Then
      await expect(noticeService.getNoticeDetail('id')).rejects.toThrow(
        new NotFoundException(ERROR.NOT_EXIST_DATA),
      );
    });
  });

  describe('getNoticeList', () => {
    it('should return empty list when repository returns []', async () => {
      // Given
      const dto: ApiNoticeGetRequestQueryDto = { size: 2 } as any;
      noticeQueryRepository.find.mockResolvedValue([]);
      // When
      const result = await noticeService.getNoticeList(dto);
      // Then
      expect(result).toEqual({ items: [], last_item_id: 0 });
    });

    it('should set last_item_id when list length equals size', async () => {
      // Given
      const dto: ApiNoticeGetRequestQueryDto = { size: 2 } as any;
      const list = [{ id: 1 }, { id: 2 }] as NoticeEntity[];
      noticeQueryRepository.find.mockResolvedValue(list);
      jest
        .spyOn(classTransformer, 'plainToInstance')
        .mockReturnValue(list as unknown as ApiNoticeGetResponseDto[]);
      // When
      const result = await noticeService.getNoticeList(dto);
      // Then
      expect(result.last_item_id).toBe(2);
    });

    it('should set last_item_id 0 when list length is less than size', async () => {
      // Given
      const dto: ApiNoticeGetRequestQueryDto = { size: 3 } as any;
      const list = [{ id: 1 }, { id: 2 }] as NoticeEntity[];
      noticeQueryRepository.find.mockResolvedValue(list);
      jest
        .spyOn(classTransformer, 'plainToInstance')
        .mockReturnValue(list as unknown as ApiNoticeGetResponseDto[]);
      // When
      const result = await noticeService.getNoticeList(dto);
      // Then
      expect(result.last_item_id).toBe(0);
    });
  });

  describe('updateNotice', () => {
    it('should save notice and return uuid when notice exists', async () => {
      // Given
      const entity = { uuid: 'id', title: 'old' } as NoticeEntity;
      const dto: ApiNoticePutRequestBodyDto = { title: 'new' };
      noticeQueryRepository.findOne.mockResolvedValue(entity);
      noticeQueryRepository.save.mockResolvedValue(entity);
      // When
      const result = await noticeService.updateNotice('id', dto);
      // Then
      expect(noticeQueryRepository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual({ uuid: 'id' });
    });

    it('should throw NotFoundException when uuid does not exist', async () => {
      // Given
      noticeQueryRepository.findOne.mockResolvedValue(null);
      // When & Then
      await expect(noticeService.updateNotice('id', {} as any)).rejects.toThrow(
        new NotFoundException(ERROR.NOT_EXIST_DATA),
      );
    });
  });

  describe('deleteNotice', () => {
    it('should archive notice and return uuid when notice exists', async () => {
      // Given
      const entity = { uuid: 'id' } as NoticeEntity;
      noticeQueryRepository.findOne.mockResolvedValue(entity);
      noticeQueryRepository.save.mockResolvedValue(entity);
      // When
      const result = await noticeService.deleteNotice('id');
      // Then
      expect(entity.archived_at).toBeInstanceOf(Date);
      expect(noticeQueryRepository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual({ uuid: 'id' });
    });

    it('should throw NotFoundException when uuid does not exist', async () => {
      // Given
      noticeQueryRepository.findOne.mockResolvedValue(null);
      // When & Then
      await expect(noticeService.deleteNotice('id')).rejects.toThrow(
        new NotFoundException(ERROR.NOT_EXIST_DATA),
      );
    });
  });
});
