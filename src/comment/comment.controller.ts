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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommentService } from 'src/comment/comment.service';
import { ApiCommentGetRequestQueryDto } from 'src/comment/dto/api-comment-get-request-query.dto';
import { ApiCommentGetResponseDto } from 'src/comment/dto/api-comment-get-response.dto';
import { ApiCommentPostRequestBodyDto } from 'src/comment/dto/api-community-post-request-body.dto';
import { ApiCommentPutRequestBodyDto } from 'src/comment/dto/api-community-put-request-body.dto';
import { ERROR } from 'src/commons/constants/error';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { NotificationInterceptor } from 'src/commons/interceptors/notification.interceptor';
import { BadWordsPipe } from 'src/commons/pipe/badwords.pipe';
import { UserDto } from 'src/user/dto/user.dto';

@ApiTags('한줄평')
@Controller('/api/comment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('/:uuid')
  @ApiOperation({
    summary: '한줄평 조회',
    description: '한줄평 조회',
  })
  @ApiSuccessResponse(ApiCommentGetResponseDto, {
    description: '한줄평 조회 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '게시글이 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async commentList(
    @Param('uuid') uuid: string,
    @Query() dto: ApiCommentGetRequestQueryDto,
    @CurrentUser() user: UserDto,
  ): Promise<ApiCommentGetResponseDto> {
    return this.commentService.commentList(uuid, dto, user);
  }

  @Post('/:uuid')
  @ApiOperation({
    summary: '한줄평 작성',
    description: '한줄평 작성',
  })
  @ApiSuccessResponse(UuidResponseDto, {
    description: '한줄평 작성 성공',
    status: HttpStatus.CREATED,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '게시글이 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  @UseInterceptors(NotificationInterceptor)
  async commentPost(
    @Param('uuid') uuid: string,
    @CurrentUser() user: UserDto,
    @Body(BadWordsPipe) dto: ApiCommentPostRequestBodyDto,
    @Req() req,
  ): Promise<UuidResponseDto> {
    const res = await this.commentService.commentPost(uuid, user, dto);
    req.notification = res.notification;
    return res.data;
  }

  @Put('/:uuid')
  @ApiOperation({
    summary: '한줄평 수정',
    description: '한줄평 수정',
  })
  @ApiSuccessResponse(UuidResponseDto, {
    description: '한줄평 수정 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '댓글 uuid가 존재하지 않거나 댓글 작성자와 유저가 다른 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '댓글 uuid',
  })
  async commentUpdate(
    @CurrentUser() user: UserDto,
    @Body(BadWordsPipe) dto: ApiCommentPutRequestBodyDto,
    @Param('uuid') uuid: string,
  ): Promise<UuidResponseDto> {
    return this.commentService.commentUpdate(user, dto, uuid);
  }

  @Patch('/:uuid')
  @ApiOperation({
    summary: '한줄평 삭제',
    description: '한줄평 삭제',
  })
  @ApiSuccessResponse(UuidResponseDto, {
    description: '한줄평 삭제 완료',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '댓글 uuid가 존재하지 않거나 댓글 작성자와 유저가 다른 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '댓글 uuid',
  })
  async commentDelete(
    @CurrentUser() user: UserDto,
    @Param('uuid') uuid: string,
  ): Promise<UuidResponseDto> {
    return this.commentService.commentDelete(user, uuid);
  }
}
