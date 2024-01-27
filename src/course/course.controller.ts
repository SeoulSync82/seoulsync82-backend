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
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { CourseService } from './course.service';
import { ApiCourseDetailGetResponseDto } from './dto/api-course-detail-get-response.dto';
import { ApiCourseMyHistoryGetRequestQueryDto } from './dto/api-course-my-history-get-request-query.dto';
import { ApiCourseMyHistoryGetResponseDto } from './dto/api-course-my-history-get-response.dto';
import { ApiCoursePlaceListGetResponseDto } from './dto/api-course-place-list-get-response.dto';
import { ApiCourseRecommendPostRequestBodyDto } from './dto/api-course-recommend-post-request-body.dto';
import { ApiCourseRecommendPostResponseDto } from './dto/api-course-recommend-post-response.dto';
import { ApiCourseSubwayCheckGetRequestQueryDto } from '../subway/dto/api-course-subway-check-get-request-query.dto';
import { ApiCourseSubwayCheckGetResponseDto } from '../subway/dto/api-course-subway-check-get-response.dto';
import { ApiCourseSubwayListGetRequestQueryDto } from '../subway/dto/api-course-subway-list-get-request-query.dto';
import { ApiCourseSubwayListGetResponseDto } from '../subway/dto/api-course-subway-list-get-response.dto';

@ApiTags('코스')
@Controller('/api/course')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/recommend')
  @ApiOperation({
    summary: 'AI 코스 추천',
    description: 'AI 코스 추천',
  })
  @ApiSuccessResponse(ApiCourseRecommendPostResponseDto, {
    description: 'AI 코스 추천 완료',
    status: HttpStatus.CREATED,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '선택한 지하철역에 custom이 부족한 경우',
    status: HttpStatus.NOT_FOUND,
  })
  async courseRecommend(@CurrentUser() user, @Body() dto: ApiCourseRecommendPostRequestBodyDto) {
    return await this.courseService.courseRecommend(user, dto);
  }

  @Get('/recommend/non-login/')
  @ApiOperation({
    summary: 'AI 코스 추천 - 비회원',
    description: 'AI 코스 추천 - 비회원',
  })
  @ApiSuccessResponse(ApiCourseRecommendPostResponseDto, {
    description: 'AI 코스 추천 완료',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '선택한 지하철역에 custom이 부족한 경우',
    status: HttpStatus.NOT_FOUND,
  })
  async courseRecommendNonLogin(@Query() dto: ApiCourseRecommendPostRequestBodyDto) {
    return await this.courseService.courseRecommendNonLogin(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/my-history')
  @ApiOperation({
    summary: '내 코스 추천내역',
    description: '내 코스 추천내역',
  })
  @ApiArraySuccessResponse(ApiCourseMyHistoryGetResponseDto, {
    description: '내 코스 추천내역 조회 성공',
    status: HttpStatus.OK,
  })
  async myCourseRecommandHistory(
    @Query() dto: ApiCourseMyHistoryGetRequestQueryDto,
    @CurrentUser() user,
  ) {
    return await this.courseService.myCourseRecommandHistory(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/:uuid')
  @ApiOperation({
    summary: '코스 상세',
    description: '코스 상세',
  })
  @ApiSuccessResponse(ApiCourseDetailGetResponseDto, {
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
  async courseDetail(@Param('uuid') uuid: string, @CurrentUser() user) {
    return await this.courseService.courseDetail(uuid, user);
  }

  @Get('/:uuid/place/list')
  @ApiOperation({
    summary: '코스 장소별 목록',
    description: '코스 장소별 목록',
  })
  @ApiSuccessResponse(ApiCoursePlaceListGetResponseDto, {
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
}
