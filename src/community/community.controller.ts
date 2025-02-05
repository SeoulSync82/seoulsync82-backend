import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
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
import { NotificationInterceptor } from 'src/commons/interceptors/notification.interceptor';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { BadWordsPipe } from 'src/commons/pipe/badwords.pipe';
import { ApiPagingSuccessResponse } from '../commons/decorators/api-paging-success-response.decorator';
import { UserDto } from '../user/dto/user.dto';
import { CommunityService } from './community.service';
import { ApiCommunityGetDetailResponseDto } from './dto/api-community-get-detail-response.dto';
import { ApiCommunityGetMyCourseRequestQueryDto } from './dto/api-community-get-my-course-request-query.dto';
import { ApiCommunityGetMyCourseResponseDto } from './dto/api-community-get-my-course-response.dto';
import { ApiCommunityGetRequestQueryDto } from './dto/api-community-get-request-query.dto';
import { ApiCommunityGetResponseDto } from './dto/api-community-get-response.dto';
import { ApiCommunityPostRequestBodyDto } from './dto/api-community-post-request-body.dto';
import { ApiCommunityPutRequestBodyDto } from './dto/api-community-put-request-body.dto';

@ApiTags('커뮤니티')
@Controller('/api/community')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 글쓰기',
    description: '커뮤니티 글쓰기',
  })
  @ApiSuccessResponse(DetailResponseDto, {
    description: '커뮤니티 글쓰기 성공',
    status: HttpStatus.CREATED,
  })
  @ApiExceptionResponse([ERROR.DUPLICATION], {
    description: '이미 작성한 게시글일 경우',
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
  async communityPost(
    @Param('uuid') uuid: string,
    @CurrentUser() user: UserDto,
    @Body(BadWordsPipe) dto: ApiCommunityPostRequestBodyDto,
  ): Promise<DetailResponseDto> {
    return await this.communityService.communityPost(uuid, user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/my/course')
  @ApiOperation({
    summary: '커뮤니티 글쓰기 - 내 코스 추천내역',
    description: '커뮤니티 글쓰기 - 내 코스 추천내역',
  })
  @ApiArraySuccessResponse(ApiCommunityGetMyCourseResponseDto, {
    description: '커뮤니티 글쓰기 - 내 코스 추천내역 조회 성공',
    status: HttpStatus.OK,
  })
  async communityMyCourseList(
    @Query() dto: ApiCommunityGetMyCourseRequestQueryDto,
    @CurrentUser() user: UserDto,
  ) {
    return await this.communityService.communityMyCourseList(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/')
  @ApiOperation({
    summary: '커뮤니티 목록',
    description: '커뮤니티 목록',
  })
  @ApiPagingSuccessResponse(ApiCommunityGetResponseDto, {
    description: '커뮤니티 목록 조회 성공',
    status: HttpStatus.OK,
  })
  async communityList(@Query() dto: ApiCommunityGetRequestQueryDto, @CurrentUser() user: UserDto) {
    return await this.communityService.communityList(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 상세',
    description: '커뮤니티 상세',
  })
  @ApiSuccessResponse(ApiCommunityGetDetailResponseDto, {
    description: '커뮤니티 상세 조회 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '커뮤니티 uuid가 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
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
  @ApiSuccessResponse(DetailResponseDto, {
    description: '커뮤니티 수정 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '커뮤니티 uuid가 존재하지 않거나 게시물 작성자와 유저가 다른 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async communityPut(
    @CurrentUser() user: UserDto,
    @Body(BadWordsPipe) dto: ApiCommunityPutRequestBodyDto,
    @Param('uuid') uuid: string,
  ): Promise<DetailResponseDto> {
    return await this.communityService.communityPut(user, dto, uuid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 삭제',
    description: '커뮤니티 삭제',
  })
  @ApiSuccessResponse(DetailResponseDto, {
    description: '북마크 삭제 완료',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '커뮤니티 uuid가 존재하지 않거나 게시물 작성자와 유저가 다른 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async communityDelete(
    @CurrentUser() user: UserDto,
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
  @ApiSuccessResponse(DetailResponseDto, {
    description: '커뮤니티 코스 좋아요 성공',
    status: HttpStatus.CREATED,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '커뮤니티 uuid가 존재하지 않은 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiExceptionResponse([ERROR.DUPLICATION], {
    description: '이미 좋아요를 누른 게시글일 경우',
    status: HttpStatus.CONFLICT,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  @UseInterceptors(NotificationInterceptor)
  async communityReaction(
    @CurrentUser() user: UserDto,
    @Param('uuid') uuid: string,
    @Req() req,
  ): Promise<DetailResponseDto> {
    const res = await this.communityService.communityReaction(user, uuid);
    req.notification = res.notification;
    return res.data;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('/:uuid/reaction')
  @ApiOperation({
    summary: '커뮤니티 코스 좋아요 취소',
    description: '커뮤니티 코스 좋아요 취소',
  })
  @ApiSuccessResponse(DetailResponseDto, {
    description: '커뮤니티 코스 좋아요 취소 성공',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '커뮤니티 uuid가 존재하지 않은 경우 || 좋아요를 누르지 않은 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiExceptionResponse([ERROR.DUPLICATION], {
    description: '이미 좋아요 취소를 누른 게시글일 경우',
    status: HttpStatus.CONFLICT,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async communityReactionDelete(
    @CurrentUser() user: UserDto,
    @Param('uuid') uuid: string,
  ): Promise<DetailResponseDto> {
    return await this.communityService.communityReactionDelete(user, uuid);
  }
}
