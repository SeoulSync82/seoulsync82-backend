import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ERROR } from 'src/auth/constants/error';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { JwtOptionalAuthGuard } from 'src/commons/auth/jwt-optional.guard';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { UserDto } from 'src/user/dto/user.dto';
import { CourseService } from './course.service';
import { ApiCourseGetDetailResponseDto } from './dto/api-course-get-detail-response.dto';
import { ApiCourseGetMyHistoryRequestQueryDto } from './dto/api-course-get-my-history-request-query.dto';
import { ApiCourseGetMyHistoryResponseDto } from './dto/api-course-get-my-history-response.dto';
import { ApiCourseGetPlaceCustomizeRequestQueryDto } from './dto/api-course-get-place-customize-request-query.dto';
import { ApiCourseGetPlaceCustomizeResponseDto } from './dto/api-course-get-place-customize-response.dto';
import { ApiCourseGetPlaceListResponseDto } from './dto/api-course-get-place-list-response.dto';
import { ApiCourseGetRecommendRequestQueryDto } from './dto/api-course-get-recommend-request-query.dto';
import { ApiCourseGetRecommendResponseDto } from './dto/api-course-get-recommend-response.dto';
import { ApiCoursePostRecommendRequestBodyDto } from './dto/api-course-post-recommend-request-body.dto';
import { ApiCoursePostRecommendResponseDto } from './dto/api-course-post-recommend-response.dto';
import { ApiCoursePostRecommendSaveRequestBodyDto } from './dto/api-course-post-recommend-save-request-body.dto';
import { ApiCoursePostSaveResponseDto } from './dto/api-course-post-save-response.dto';

@ApiTags('코스')
@Controller('/api/course')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtOptionalAuthGuard)
  @Get('/recommend')
  @ApiOperation({
    summary: 'AI 코스 추천',
    description: 'AI 코스 추천',
  })
  @ApiSuccessResponse(ApiCourseGetRecommendResponseDto, {
    description: 'AI 코스 추천 완료',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description:
      '선택한 지하철역에 음식점, 카페, 술집이 부족한 경우 or 지하철 역, 테마 uuid가 존재하지 않는 경우',
    status: HttpStatus.NOT_FOUND,
  })
  async courseRecommend(
    @Query() dto: ApiCourseGetRecommendRequestQueryDto,
    @CurrentUser() user?: UserDto,
  ) {
    return await this.courseService.courseRecommend(dto, user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtOptionalAuthGuard)
  @Get('/place/customize')
  @ApiOperation({
    summary: 'AI 코스 장소 추가',
    description: 'AI 코스 장소 추가',
  })
  @ApiSuccessResponse(ApiCourseGetPlaceCustomizeResponseDto, {
    description: 'AI 코스 장소 추가 완료',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '선택한 지하철역에 장소가 부족한 경우',
    status: HttpStatus.NOT_FOUND,
  })
  async coursePlaceCustomize(
    @Query() dto: ApiCourseGetPlaceCustomizeRequestQueryDto,
    @CurrentUser() user?: UserDto,
  ) {
    return await this.courseService.coursePlaceCustomize(dto, user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtOptionalAuthGuard)
  @Post('/recommend/save')
  @ApiOperation({
    summary: 'AI 코스 추천 저장',
    description: 'AI 코스 추천 저장',
  })
  @ApiSuccessResponse(ApiCoursePostSaveResponseDto, {
    description: 'AI 코스 추천 저장 완료',
    status: HttpStatus.OK,
  })
  async courseRecommendSave(
    @Body() dto: ApiCoursePostRecommendSaveRequestBodyDto,
    @CurrentUser() user?: UserDto,
  ) {
    return await this.courseService.courseRecommendSave(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/my-history')
  @ApiOperation({
    summary: '내 코스 추천내역',
    description: '내 코스 추천내역',
  })
  @ApiArraySuccessResponse(ApiCourseGetMyHistoryResponseDto, {
    description: '내 코스 추천내역 조회 성공',
    status: HttpStatus.OK,
  })
  async myCourseRecommandHistory(
    @Query() dto: ApiCourseGetMyHistoryRequestQueryDto,
    @CurrentUser() user: UserDto,
  ) {
    return await this.courseService.myCourseRecommandHistory(dto, user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtOptionalAuthGuard)
  @Get('/:uuid')
  @ApiOperation({
    summary: '코스 상세',
    description: '코스 상세',
  })
  @ApiSuccessResponse(ApiCourseGetDetailResponseDto, {
    description: '코스 상세 조회 성공',
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
  async courseDetail(@Param('uuid') uuid: string, @CurrentUser() user?: UserDto) {
    return await this.courseService.courseDetail(uuid, user);
  }

  @Get('/:uuid/place/list')
  @ApiOperation({
    summary: '코스 장소별 목록',
    description: '코스 장소별 목록',
    deprecated: true,
  })
  @ApiSuccessResponse(ApiCourseGetPlaceListResponseDto, {
    description: '코스 장소별 목록 조회 성공',
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
  async coursePlaceList(@Param('uuid') uuid: string) {
    return await this.courseService.coursePlaceList(uuid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/member/recommend/deprecated')
  @ApiOperation({
    summary: '#deprecated AI 코스 추천 - 회원',
    description: '#deprecated AI 코스 추천 - 회원',
    deprecated: true,
  })
  @ApiSuccessResponse(ApiCoursePostRecommendResponseDto, {
    description: 'AI 코스 추천 완료',
    status: HttpStatus.CREATED,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '선택한 지하철역에 custom이 부족한 경우',
    status: HttpStatus.NOT_FOUND,
  })
  async old_courseMemberRecommend(
    @CurrentUser() user: UserDto,
    @Body() dto: ApiCoursePostRecommendRequestBodyDto,
  ) {
    return await this.courseService.old_courseMemberRecommend(user, dto);
  }

  @Get('/guest/recommend/deprecated')
  @ApiOperation({
    summary: '#deprecated AI 코스 추천 - 비회원',
    description: '#deprecated AI 코스 추천 - 비회원',
    deprecated: true,
  })
  @ApiSuccessResponse(ApiCoursePostRecommendResponseDto, {
    description: 'AI 코스 추천 완료',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '선택한 지하철역에 custom이 부족한 경우',
    status: HttpStatus.NOT_FOUND,
  })
  async old_courseGuestRecommend(@Query() dto: ApiCoursePostRecommendRequestBodyDto) {
    return await this.courseService.old_courseGuestRecommend(dto);
  }
}
