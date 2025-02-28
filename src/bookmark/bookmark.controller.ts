import { Controller, Get, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { ApiBookmarkGetDetailResponseDto } from 'src/bookmark/dto/api-bookmark-get-detail-response.dto';
import { ApiBookmarkGetRequestQueryDto } from 'src/bookmark/dto/api-bookmark-get-request-query.dto';
import { ApiBookmarkGetResponseDto } from 'src/bookmark/dto/api-bookmark-get-response.dto';
import { ApiArrayLastItemIdSuccessResponse } from 'src/commons/decorators/api-array-last-item-id-success-response.decorator';
// import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ERROR } from 'src/commons/constants/error';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
// import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { UserDto } from 'src/user/dto/user.dto';

@ApiTags('북마크')
@Controller('/api/bookmark')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get('/')
  @ApiOperation({
    summary: '북마크 목록',
    description: '북마크 목록',
  })
  @ApiArrayLastItemIdSuccessResponse(ApiBookmarkGetResponseDto, {
    description: '북마크 목록 조회 성공',
    status: HttpStatus.OK,
  })
  async bookmarkList(@Query() dto: ApiBookmarkGetRequestQueryDto, @CurrentUser() user: UserDto) {
    return this.bookmarkService.bookmarkList(dto, user);
  }

  @Get('/:uuid')
  @ApiOperation({
    summary: '북마크 상세',
    description: '북마크 상세',
    deprecated: true,
  })
  @ApiSuccessResponse(ApiBookmarkGetDetailResponseDto, {
    description: '북마크 상세 조회 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '코스 uuid가 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '코스 uuid',
  })
  async myCourseDetail(@Param('uuid') uuid: string) {
    return this.bookmarkService.myCourseDetail(uuid);
  }

  @Post('/:uuid')
  @ApiOperation({
    summary: '북마크 저장',
    description: '북마크 저장',
  })
  @ApiSuccessResponse(UuidResponseDto, {
    description: '북마크 저장 완료',
    status: HttpStatus.CREATED,
  })
  @ApiExceptionResponse([ERROR.DUPLICATION], {
    description: '이미 저장한 북마크일 경우',
    status: HttpStatus.CONFLICT,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '코스 uuid가 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '코스 uuid',
  })
  async bookmarkSave(
    @CurrentUser() user: UserDto,
    @Param('uuid') uuid: string,
  ): Promise<UuidResponseDto> {
    return this.bookmarkService.bookmarkSave(user, uuid);
  }

  @Patch('/:uuid')
  @ApiOperation({
    summary: '북마크 삭제',
    description: '북마크 삭제',
  })
  @ApiSuccessResponse(UuidResponseDto, {
    description: '북마크 삭제 완료',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '코스 uuid가 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '코스 uuid',
  })
  async bookmarkDelete(
    @CurrentUser() user: UserDto,
    @Param('uuid') uuid: string,
  ): Promise<UuidResponseDto> {
    return this.bookmarkService.bookmarkDelete(user, uuid);
  }
}
