import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ERROR } from 'src/auth/constants/error';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { BookmarkService } from './bookmark.service';
import { ApiBookmarkDetailGetResponseDto } from './dto/api-bookmark-detail-get-response.dto';
import { ApiBookmarkGetRequestQueryDto } from './dto/api-bookmark-get-request-query.dto';
import { ApiBookmarkGetResponseDto } from './dto/api-bookmark-get-response.dto';

@ApiTags('북마크')
@Controller('/api/bookmark')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(SuccessInterceptor)
@UseFilters(SeoulSync82ExceptionFilter)
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get('/')
  @ApiOperation({
    summary: '북마크 목록',
    description: '북마크 목록',
  })
  @ApiArraySuccessResponse(ApiBookmarkGetResponseDto, {
    description: '북마크 목록 조회 성공',
    status: HttpStatus.OK,
  })
  async bookmarkList(@Query() dto: ApiBookmarkGetRequestQueryDto, @CurrentUser() user) {
    return await this.bookmarkService.bookmarkList(dto, user);
  }

  @Get('/:uuid')
  @ApiOperation({
    summary: '북마크 상세',
    description: '북마크 상세',
    deprecated: true,
  })
  @ApiSuccessResponse(ApiBookmarkDetailGetResponseDto, {
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
    return await this.bookmarkService.myCourseDetail(uuid);
  }

  @Post('/:uuid')
  @ApiOperation({
    summary: '북마크 저장',
    description: '북마크 저장',
  })
  @ApiSuccessResponse(DetailResponseDto, {
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
  async bookmarkSave(@CurrentUser() user, @Param('uuid') uuid: string): Promise<DetailResponseDto> {
    return await this.bookmarkService.bookmarkSave(user, uuid);
  }

  @Patch('/:uuid')
  @ApiOperation({
    summary: '북마크 삭제',
    description: '북마크 삭제',
  })
  @ApiSuccessResponse(DetailResponseDto, {
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
    @CurrentUser() user,
    @Param('uuid') uuid: string,
  ): Promise<DetailResponseDto> {
    return await this.bookmarkService.bookmarkDelete(user, uuid);
  }
}
