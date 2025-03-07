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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ERROR } from 'src/commons/constants/error';
import { ApiArrayLastItemIdSuccessResponse } from 'src/commons/decorators/api-array-last-item-id-success-response.decorator';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiPagingSuccessResponse } from 'src/commons/decorators/api-paging-success-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { CursorPaginatedResponseDto } from 'src/commons/dtos/cursor-paginated-response.dto';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { BadWordsPipe } from 'src/commons/pipe/badwords.pipe';
import { CommunityService } from 'src/community/community.service';
import { ApiCommunityGetDetailResponseDto } from 'src/community/dto/api-community-get-detail-response.dto';
import { ApiCommunityGetMyCourseRequestQueryDto } from 'src/community/dto/api-community-get-my-course-request-query.dto';
import { ApiCommunityGetMyCourseResponseDto } from 'src/community/dto/api-community-get-my-course-response.dto';
import { ApiCommunityGetRequestQueryDto } from 'src/community/dto/api-community-get-request-query.dto';
import { ApiCommunityGetResponseDto } from 'src/community/dto/api-community-get-response.dto';
import { ApiCommunityPostRequestBodyDto } from 'src/community/dto/api-community-post-request-body.dto';
import { ApiCommunityPutRequestBodyDto } from 'src/community/dto/api-community-put-request-body.dto';
import { UserDto } from 'src/user/dto/user.dto';

@ApiTags('커뮤니티')
@Controller('/api/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 글쓰기',
    description: '커뮤니티 글쓰기',
  })
  @ApiSuccessResponse(UuidResponseDto, {
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
  ): Promise<UuidResponseDto> {
    return this.communityService.communityPost(uuid, user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/my/course')
  @ApiOperation({
    summary: '커뮤니티 글쓰기 - 내 코스 추천내역',
    description: '커뮤니티 글쓰기 - 내 코스 추천내역',
  })
  @ApiArrayLastItemIdSuccessResponse(ApiCommunityGetMyCourseResponseDto, {
    description: '커뮤니티 글쓰기 - 내 코스 추천내역 조회 성공',
    status: HttpStatus.OK,
  })
  async communityMyCourseList(
    @Query() dto: ApiCommunityGetMyCourseRequestQueryDto,
    @CurrentUser() user: UserDto,
  ): Promise<LastItemIdResponseDto<ApiCommunityGetMyCourseResponseDto>> {
    return this.communityService.communityMyCourseList(dto, user);
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
  async communityList(
    @Query() dto: ApiCommunityGetRequestQueryDto,
    @CurrentUser() user: UserDto,
  ): Promise<CursorPaginatedResponseDto<ApiCommunityGetResponseDto>> {
    return this.communityService.communityList(dto, user);
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
    return this.communityService.communityDetail(uuid, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Put('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 수정',
    description: '커뮤니티 수정',
  })
  @ApiSuccessResponse(UuidResponseDto, {
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
  ): Promise<UuidResponseDto> {
    return this.communityService.communityPut(user, dto, uuid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 삭제',
    description: '커뮤니티 삭제',
  })
  @ApiSuccessResponse(UuidResponseDto, {
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
  ): Promise<UuidResponseDto> {
    return this.communityService.communityDelete(user, uuid);
  }
}
