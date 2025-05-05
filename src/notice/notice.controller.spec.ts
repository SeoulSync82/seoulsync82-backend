import { TestBed } from '@automock/jest';
import { NotFoundException } from '@nestjs/common';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { ApiNoticeGetDetailResponseDto } from 'src/notice/dto/api-notice-get-detail-response.dto';
import { ApiNoticeGetRequestQueryDto } from 'src/notice/dto/api-notice-get-request-query.dto';
import { ApiNoticeGetResponseDto } from 'src/notice/dto/api-notice-get-response.dto';
import { ApiNoticePostRequestBodyDto } from 'src/notice/dto/api-notice-post-request-body.dto';
import { ApiNoticePutRequestBodyDto } from 'src/notice/dto/api-notice-put-request-body.dto';
import { NoticeController } from 'src/notice/notice.controller';
import { NoticeService } from 'src/notice/notice.service';

describe('NoticeController', () => {
  let controller: NoticeController;
  let noticeService: jest.Mocked<NoticeService>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(NoticeController).compile();
    controller = unit;
    noticeService = unitRef.get(NoticeService);
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
      const expected: UuidResponseDto = { uuid: 'id' };
      jest.spyOn(noticeService, 'createNotice').mockResolvedValue(expected);
      // When
      const result = await controller.createNotice(dto as any);
      // Then
      expect(noticeService.createNotice).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('getNoticeDetail', () => {
    it('should return detail dto when uuid exists', async () => {
      // Given
      const expected = { uuid: 'id', title: 'hello' } as ApiNoticeGetDetailResponseDto;
      jest.spyOn(noticeService, 'getNoticeDetail').mockResolvedValue(expected);
      // When
      const result = await controller.getNoticeDetail('id');
      // Then
      expect(noticeService.getNoticeDetail).toHaveBeenCalledWith('id');
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when uuid does not exist', async () => {
      // Given
      jest.spyOn(noticeService, 'getNoticeDetail').mockRejectedValue(new NotFoundException());
      // When
      const when = () => controller.getNoticeDetail('id');
      // Then
      await expect(when()).rejects.toThrow(NotFoundException);
    });
  });

  describe('getNoticeList', () => {
    it('should return list result when dto is given', async () => {
      // Given
      const dto: ApiNoticeGetRequestQueryDto = { size: 5, last_id: 0 } as any;
      const expected: LastItemIdResponseDto<ApiNoticeGetResponseDto> = {
        items: [],
        last_item_id: 0,
      };
      jest.spyOn(noticeService, 'getNoticeList').mockResolvedValue(expected);
      // When
      const result = await controller.getNoticeList(dto);
      // Then
      expect(noticeService.getNoticeList).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('updateNotice', () => {
    it('should return uuid when update succeeds', async () => {
      // Given
      const dto: ApiNoticePutRequestBodyDto = {
        title: 'new',
        content: 'c',
        published_at: new Date(),
      };
      const expected: UuidResponseDto = { uuid: 'id' };
      jest.spyOn(noticeService, 'updateNotice').mockResolvedValue(expected);
      // When
      const result = await controller.updateNotice('id', dto as any);
      // Then
      expect(noticeService.updateNotice).toHaveBeenCalledWith('id', dto);
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when uuid does not exist', async () => {
      // Given
      jest.spyOn(noticeService, 'updateNotice').mockRejectedValue(new NotFoundException());
      // When
      const when = () => controller.updateNotice('id', {} as any);
      // Then
      await expect(when()).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteNotice', () => {
    it('should return uuid when delete succeeds', async () => {
      // Given
      const expected: UuidResponseDto = { uuid: 'id' };
      jest.spyOn(noticeService, 'deleteNotice').mockResolvedValue(expected);
      // When
      const result = await controller.deleteNotice('id');
      // Then
      expect(noticeService.deleteNotice).toHaveBeenCalledWith('id');
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when uuid does not exist', async () => {
      // Given
      jest.spyOn(noticeService, 'deleteNotice').mockRejectedValue(new NotFoundException());
      // When
      const when = () => controller.deleteNotice('id');
      // Then
      await expect(when()).rejects.toThrow(NotFoundException);
    });
  });
});
