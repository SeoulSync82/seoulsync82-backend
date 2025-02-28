import { Body, Controller, Get, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtOptionalAuthGuard } from 'src/auth/guards/jwt-optional.guard';
import { ERROR } from 'src/commons/constants/error';
import { ApiArrayLastItemIdSuccessResponse } from 'src/commons/decorators/api-array-last-item-id-success-response.decorator';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { CourseRecommendationService } from 'src/course/course-recommendation.service';
import { CourseService } from 'src/course/course.service';
import { ApiCourseGetDetailResponseDto } from 'src/course/dto/api-course-get-detail-response.dto';
import { ApiCourseGetMyHistoryRequestQueryDto } from 'src/course/dto/api-course-get-my-history-request-query.dto';
import { ApiCourseGetMyHistoryResponseDto } from 'src/course/dto/api-course-get-my-history-response.dto';
import { ApiCourseGetPlaceCustomizeRequestQueryDto } from 'src/course/dto/api-course-get-place-customize-request-query.dto';
import { ApiCourseGetPlaceCustomizeResponseDto } from 'src/course/dto/api-course-get-place-customize-response.dto';
import { ApiCourseGetPlaceListResponseDto } from 'src/course/dto/api-course-get-place-list-response.dto';
import { ApiCourseGetRecommendRequestQueryDto } from 'src/course/dto/api-course-get-recommend-request-query.dto';
import { ApiCourseGetRecommendResponseDto } from 'src/course/dto/api-course-get-recommend-response.dto';
import { ApiCoursePostRecommendSaveRequestBodyDto } from 'src/course/dto/api-course-post-recommend-save-request-body.dto';
import { ApiCoursePostSaveResponseDto } from 'src/course/dto/api-course-post-save-response.dto';
import { UserDto } from 'src/user/dto/user.dto';

@ApiTags('코스')
@Controller('/api/course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly courseRecommendationService: CourseRecommendationService,
  ) {}

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
  ): Promise<ApiCourseGetRecommendResponseDto> {
    return this.courseRecommendationService.getCourseRecommendation(dto, user);
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
  ): Promise<ApiCourseGetPlaceCustomizeResponseDto> {
    return this.courseRecommendationService.addCustomPlaceToCourse(dto, user);
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
  ): Promise<ApiCoursePostSaveResponseDto> {
    return this.courseService.saveCourseRecommend(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/my-history')
  @ApiOperation({
    summary: '내 코스 추천내역',
    description: '내 코스 추천내역',
  })
  @ApiArrayLastItemIdSuccessResponse(ApiCourseGetMyHistoryResponseDto, {
    description: '내 코스 추천내역 조회 성공',
    status: HttpStatus.OK,
  })
  async myCourseRecommandHistory(
    @Query() dto: ApiCourseGetMyHistoryRequestQueryDto,
    @CurrentUser() user: UserDto,
  ): Promise<LastItemIdResponseDto<ApiCourseGetMyHistoryResponseDto>> {
    return this.courseService.getMyCourseHistory(dto, user);
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
  async courseDetail(
    @Param('uuid') uuid: string,
    @CurrentUser() user?: UserDto,
  ): Promise<ApiCourseGetDetailResponseDto> {
    return this.courseService.getCourseDetail(uuid, user);
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
  async coursePlaceList(@Param('uuid') uuid: string): Promise<ApiCourseGetPlaceListResponseDto> {
    return this.courseService.getCoursePlaceList(uuid);
  }
}
