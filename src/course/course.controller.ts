import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { DetailResponseDto, ResponseDataDto, ResponseDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { CourseService } from './course.service';
import { CourseRecommendReqDto } from './dto/course.dto';

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
  @ApiResponse({
    status: 200,
    description: 'AI 코스 추천',
    type: DetailResponseDto,
  })
  async courseRecommend(
    @CurrentUser() user,
    @Body() dto: CourseRecommendReqDto,
  ): Promise<DetailResponseDto> {
    return await this.courseService.courseRecommend(user, dto);
  }

  @Get('/recommend/non-login/')
  @ApiOperation({
    summary: 'AI 코스 추천 - 비회원',
    description: 'AI 코스 추천 - 비회원',
  })
  @ApiResponse({
    status: 200,
    description: 'AI 코스 추천 - 비회원',
    type: DetailResponseDto,
  })
  async courseRecommendNonLogin(@Query() dto: CourseRecommendReqDto): Promise<DetailResponseDto> {
    return await this.courseService.courseRecommendNonLogin(dto);
  }
}
