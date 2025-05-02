import { Injectable, NotFoundException } from '@nestjs/common';
import { generateUUID } from 'blanc-logger';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/commons/constants/error';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { NoticeEntity } from 'src/entities/notice.entity';
import { ApiNoticeGetDetailResponseDto } from 'src/notice/dto/api-notice-get-detail-response.dto';
import { ApiNoticeGetRequestQueryDto } from 'src/notice/dto/api-notice-get-request-query.dto';
import { ApiNoticeGetResponseDto } from 'src/notice/dto/api-notice-get-response.dto';
import { ApiNoticePostRequestBodyDto } from 'src/notice/dto/api-notice-post-request-body.dto';
import { ApiNoticePutRequestBodyDto } from 'src/notice/dto/api-notice-put-request-body.dto';
import { NoticeQueryRepository } from 'src/notice/notice.query.repository';

@Injectable()
export class NoticeService {
  constructor(private readonly noticeQueryRepository: NoticeQueryRepository) {}

  async createNotice(dto: ApiNoticePostRequestBodyDto) {
    const noticeEntity = new NoticeEntity();
    noticeEntity.uuid = generateUUID();
    noticeEntity.title = dto.title;
    noticeEntity.content = dto.content;
    noticeEntity.published_at = dto.published_at;

    await this.noticeQueryRepository.save(noticeEntity);

    return { uuid: noticeEntity.uuid };
  }

  async getNoticeDetail(uuid: string) {
    const notice: NoticeEntity = await this.noticeQueryRepository.findOne(uuid);
    if (isEmpty(notice)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    return plainToInstance(ApiNoticeGetDetailResponseDto, notice, {
      excludeExtraneousValues: true,
    });
  }

  async getNoticeList(
    dto: ApiNoticeGetRequestQueryDto,
  ): Promise<LastItemIdResponseDto<ApiNoticeGetResponseDto>> {
    const noticeList: NoticeEntity[] = await this.noticeQueryRepository.find(dto);
    if (noticeList.length === 0) {
      return { items: [], last_item_id: 0 };
    }

    const lastItemId = noticeList.length === dto.size ? noticeList[noticeList.length - 1].id : 0;

    return {
      items: plainToInstance(ApiNoticeGetResponseDto, noticeList, {
        excludeExtraneousValues: true,
      }),
      last_item_id: lastItemId,
    };
  }

  async updateNotice(uuid: string, dto: ApiNoticePutRequestBodyDto): Promise<UuidResponseDto> {
    const notice: NoticeEntity = await this.noticeQueryRepository.findOne(uuid);
    if (isEmpty(notice)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    Object.assign(notice, dto);

    await this.noticeQueryRepository.save(notice);

    return { uuid };
  }

  async deleteNotice(uuid: string): Promise<UuidResponseDto> {
    const notice: NoticeEntity = await this.noticeQueryRepository.findOne(uuid);
    if (isEmpty(notice)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    notice.archived_at = new Date();
    await this.noticeQueryRepository.save(notice);

    return { uuid };
  }
}
