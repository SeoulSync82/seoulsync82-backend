import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ERROR } from 'src/commons/constants/error';
import { ApiArrayLastItemIdSuccessResponse } from 'src/commons/decorators/api-array-last-item-id-success-response.decorator';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { BadWordsPipe } from 'src/commons/pipe/badwords.pipe';
import { ApiNoticeGetDetailResponseDto } from 'src/notice/dto/api-notice-get-detail-response.dto';
import { ApiNoticeGetRequestQueryDto } from 'src/notice/dto/api-notice-get-request-query.dto';
import { ApiNoticeGetResponseDto } from 'src/notice/dto/api-notice-get-response.dto';
import { ApiNoticePostRequestBodyDto } from 'src/notice/dto/api-notice-post-request-body.dto';
import { ApiNoticePutRequestBodyDto } from 'src/notice/dto/api-notice-put-request-body.dto';
import { NoticeService } from 'src/notice/notice.service';

@ApiTags('공지사항')
@Controller('/api/notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  @ApiOperation({
    summary: '공지사항 등록',
    description: '공지사항을 생성합니다.',
  })
  @ApiSuccessResponse(UuidResponseDto, {
    description: '공지사항 등록 성공',
    status: HttpStatus.CREATED,
  })
  createNotice(@Body(BadWordsPipe) dto: ApiNoticePostRequestBodyDto): Promise<UuidResponseDto> {
    return this.noticeService.createNotice(dto);
  }

  @Get('/:uuid')
  @ApiOperation({
    summary: '공지사항 상세',
    description: '공지사항 상세 조회',
  })
  @ApiSuccessResponse(ApiNoticeGetDetailResponseDto, {
    description: '공지사항 상세 조회 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '공지사항 uuid가 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: true,
    description: '공지사항 uuid',
  })
  async getNoticeDetail(@Param('uuid') uuid: string): Promise<ApiNoticeGetDetailResponseDto> {
    return this.noticeService.getNoticeDetail(uuid);
  }

  @Get('/')
  @ApiOperation({
    summary: '공지사항 목록',
    description: '공지사항 목록 조회',
  })
  @ApiArrayLastItemIdSuccessResponse(ApiNoticeGetResponseDto, {
    description: '공지사항 목록 조회 성공',
    status: HttpStatus.OK,
  })
  async getNoticeList(
    @Query() dto: ApiNoticeGetRequestQueryDto,
  ): Promise<LastItemIdResponseDto<ApiNoticeGetResponseDto>> {
    return this.noticeService.getNoticeList(dto);
  }

  @Put('/:uuid')
  @ApiOperation({
    summary: '공지사항 수정',
    description: '공지사항 수정',
  })
  @ApiSuccessResponse(UuidResponseDto, {
    description: '공지사항 수정 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '공지사항 uuid가 존재하지 않는 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: true,
    description: '공지사항 uuid',
  })
  async updateNotice(
    @Param('uuid') uuid: string,
    @Body(BadWordsPipe) dto: ApiNoticePutRequestBodyDto,
  ): Promise<UuidResponseDto> {
    return this.noticeService.updateNotice(uuid, dto);
  }

  @Patch('/:uuid')
  @ApiOperation({
    summary: '공지사항 삭제',
    description: '공지사항 삭제',
  })
  @ApiSuccessResponse(UuidResponseDto, {
    description: '공지사항 삭제 성공',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '공지사항 uuid가 존재하지 않는 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: true,
    description: '공지사항 uuid',
  })
  async deleteNotice(@Param('uuid') uuid: string): Promise<UuidResponseDto> {
    return this.noticeService.deleteNotice(uuid);
  }
}
