import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { SubwayCustomCheckResDto } from 'src/place/dto/subway.dto';
import { SubwayQueryRepository } from 'src/place/subway.query.repository';
import { CourseService } from './course.service';
import {
  CourseRecommendReqDto,
  CourseRecommendResDto,
  SubwayCustomsCheckReqDto,
} from './dto/course.dto';

@ApiTags('코스')
@Controller('/api/course')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly subwayQueryRepository: SubwayQueryRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/recommend')
  @ApiOperation({
    summary: 'AI 코스 추천',
    description: 'AI 코스 추천',
  })
  @ApiSuccessResponse(CourseRecommendResDto)
  async courseRecommend(@CurrentUser() user, @Body() dto: CourseRecommendReqDto) {
    return await this.courseService.courseRecommend(user, dto);
  }

  @Get('/recommend/non-login/')
  @ApiOperation({
    summary: 'AI 코스 추천 - 비회원',
    description: 'AI 코스 추천 - 비회원',
  })
  @ApiSuccessResponse(CourseRecommendResDto)
  async courseRecommendNonLogin(@Query() dto: CourseRecommendReqDto) {
    return await this.courseService.courseRecommendNonLogin(dto);
  }

  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access-token')
  // @Post('/:uuid/save')
  // @ApiOperation({
  //   summary: 'AI 코스 내 코스 저장',
  //   description: 'AI 코스 내 코스 저장',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'AI 코스 내 코스 저장',
  //   type: DetailResponseDto,
  // })
  // @ApiParam({
  //   name: 'uuid',
  //   type: 'string',
  //   required: false,
  //   description: '코스 uuid',
  // })
  // async courseSave(
  //   @CurrentUser() user,
  //   @Param('uuid') uuid: string,
  //   @Body() dto: CourseSaveReqDto,
  // ): Promise<DetailResponseDto> {
  //   return await this.courseService.courseSave(user, uuid, dto);
  // }

  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access-token')
  // @Delete('/:uuid/delete')
  // @ApiOperation({
  //   summary: 'AI 코스 내 코스 삭제',
  //   description: 'AI 코스 내 코스 삭제',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'AI 코스 내 코스 삭제',
  //   type: DetailResponseDto,
  // })
  // @ApiParam({
  //   name: 'uuid',
  //   type: 'string',
  //   required: false,
  //   description: '코스 uuid',
  // })
  // async courseDelete(@CurrentUser() user, @Param('uuid') uuid: string): Promise<DetailResponseDto> {
  //   return await this.courseService.courseDelete(user, uuid);
  // }

  @Get('/subway/customs-check')
  @ApiOperation({
    summary: '지하철 역 커스텀 체크',
    description: '지하철 역 커스텀 체크',
  })
  @ApiSuccessResponse(SubwayCustomCheckResDto)
  async subwayCustomsCheck(@Query() dto: SubwayCustomsCheckReqDto) {
    return await this.courseService.subwayCustomsCheck(dto);
  }
}
