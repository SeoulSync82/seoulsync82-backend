import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { NotificationInterceptor } from 'src/commons/interceptors/notification.interceptor';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { BadWordsPipe } from 'src/commons/pipe/badwords.pipe';
import { CommunityService } from './community.service';
import {
  CommunityDetailResDto,
  CommunityListReqDto,
  CommunityListResDto,
  CommunityMyCourseListReqDto,
  CommunityMyCourseListResDto,
  CommunityPostReqDto,
  CommunityPutReqDto,
} from './dto/community.dto';

@ApiTags('커뮤니티')
@Controller('/api/community')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/')
  @ApiOperation({
    summary: '커뮤니티 글쓰기',
    description: '커뮤니티 글쓰기',
  })
  @ApiResponse({
    status: 200,
    description: '커뮤니티 글쓰기',
    type: DetailResponseDto,
  })
  async communityPost(
    @CurrentUser() user,
    @Body(BadWordsPipe) dto: CommunityPostReqDto,
  ): Promise<DetailResponseDto> {
    return await this.communityService.communityPost(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/my/course')
  @ApiOperation({
    summary: '커뮤니티 글쓰기 - 내 코스 목록',
    description: '커뮤니티 글쓰기 - 내 코스 목록',
  })
  @ApiArraySuccessResponse(CommunityMyCourseListResDto)
  async communityMyCourseList(@Query() dto: CommunityMyCourseListReqDto, @CurrentUser() user) {
    return await this.communityService.communityMyCourseList(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/')
  @ApiOperation({
    summary: '커뮤니티 목록',
    description: '커뮤니티 목록',
  })
  @ApiArraySuccessResponse(CommunityListResDto)
  async communityList(@Query() dto: CommunityListReqDto, @CurrentUser() user) {
    return await this.communityService.communityList(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 상세',
    description: '커뮤니티 상세',
  })
  @ApiSuccessResponse(CommunityDetailResDto)
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async communityDetail(@Param('uuid') uuid: string, @CurrentUser() user) {
    return await this.communityService.communityDetail(uuid, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Put('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 수정',
    description: '커뮤니티 수정',
  })
  @ApiResponse({
    status: 200,
    description: '커뮤니티 수정',
    type: DetailResponseDto,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async communityPut(
    @CurrentUser() user,
    @Body(BadWordsPipe) dto: CommunityPutReqDto,
    @Param('uuid') uuid: string,
  ): Promise<DetailResponseDto> {
    return await this.communityService.communityPut(user, dto, uuid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 삭제',
    description: '커뮤니티 삭제',
  })
  @ApiResponse({
    status: 200,
    description: '커뮤니티 삭제',
    type: DetailResponseDto,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async communityDelete(
    @CurrentUser() user,
    @Param('uuid') uuid: string,
  ): Promise<DetailResponseDto> {
    return await this.communityService.communityDelete(user, uuid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/:uuid/reaction')
  @ApiOperation({
    summary: '커뮤니티 코스 좋아요',
    description: '커뮤니티 코스 좋아요',
  })
  @ApiResponse({
    status: 200,
    description: '커뮤니티 코스 좋아요',
    type: DetailResponseDto,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  @UseInterceptors(NotificationInterceptor)
  async communityReaction(
    @CurrentUser() user,
    @Param('uuid') uuid: string,
    @Req() req,
  ): Promise<DetailResponseDto> {
    const res = await this.communityService.communityReaction(user, uuid);
    req.notification = res.notification;
    return res.data;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete('/:uuid/reaction')
  @ApiOperation({
    summary: '커뮤니티 코스 좋아요 취소',
    description: '커뮤니티 코스 좋아요 취소',
  })
  @ApiResponse({
    status: 200,
    description: '커뮤니티 코스 좋아요 취소',
    type: DetailResponseDto,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async communityReactionDelete(
    @CurrentUser() user,
    @Param('uuid') uuid: string,
  ): Promise<DetailResponseDto> {
    return await this.communityService.communityReactionDelete(user, uuid);
  }
}
