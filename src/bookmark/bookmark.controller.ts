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
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import {
  CourseSaveReqDto,
  MyCourseDetailResDto,
  MyCourseListReqDto,
  MyCourseListResDto,
} from './dto/bookmark.dto';
import { BookmarkService } from './bookmark.service';

@ApiTags('북마크')
@Controller('/api/bookmark')
@UseInterceptors(SuccessInterceptor)
@UseFilters(SeoulSync82ExceptionFilter)
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/')
  @ApiOperation({
    summary: '내 코스 목록',
    description: '내 코스 목록',
  })
  @ApiArraySuccessResponse(MyCourseListResDto)
  async myCourseList(@Query() dto: MyCourseListReqDto, @CurrentUser() user) {
    return await this.bookmarkService.myCourseList(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/:uuid')
  @ApiOperation({
    summary: '내 코스 상세',
    description: '내 코스 상세',
  })
  @ApiSuccessResponse(MyCourseDetailResDto)
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '내코스 uuid',
  })
  async myCourseDetail(@Param('uuid') uuid: string) {
    return await this.bookmarkService.myCourseDetail(uuid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/:uuid')
  @ApiOperation({
    summary: '북마크 저장',
    description: '북마크 저장',
  })
  @ApiResponse({
    status: 200,
    description: '북마크 저장',
    type: DetailResponseDto,
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete('/:uuid')
  @ApiOperation({
    summary: '북마크 삭제',
    description: '북마크 삭제',
  })
  @ApiResponse({
    status: 200,
    description: '북마크 삭제',
    type: DetailResponseDto,
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
