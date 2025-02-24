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
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ERROR } from '../commons/constants/error';
import { ApiExceptionResponse } from '../commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from '../commons/decorators/api-success-response.decorator';
import { CurrentUser } from '../commons/decorators/user.decorator';
import { DetailResponseDto } from '../commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from '../commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from '../commons/interceptors/success.interceptor';
import { BadWordsPipe } from '../commons/pipe/badwords.pipe';
import { UserDto } from '../user/dto/user.dto';
import { CommentService } from './comment.service';
import { ApiCommentGetRequestQueryDto } from './dto/api-comment-get-request-query.dto';
import { ApiCommentPostRequestBodyDto } from './dto/api-community-post-request-body.dto';
import { ApiCommentPutRequestBodyDto } from './dto/api-community-put-request-body.dto';

@ApiTags('한줄평')
@Controller('/api/comment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(SuccessInterceptor)
@UseFilters(SeoulSync82ExceptionFilter)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @Get('/:uuid')
  @ApiOperation({
    summary: '한줄평 조회',
    description: '한줄평 조회',
  })
  @ApiSuccessResponse(DetailResponseDto, {
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
  ) {
    return await this.commentService.commentList(uuid, dto, user);
  }

  @Post('/:uuid')
  @ApiOperation({
    summary: '한줄평 작성',
    description: '한줄평 작성',
  })
  @ApiSuccessResponse(DetailResponseDto, {
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
  async commentPost(
    @Param('uuid') uuid: string,
    @CurrentUser() user: UserDto,
    @Body(BadWordsPipe) dto: ApiCommentPostRequestBodyDto,
  ): Promise<DetailResponseDto> {
    return await this.commentService.commentPost(uuid, user, dto);
  }

  @Put('/:uuid')
  @ApiOperation({
    summary: '한줄평 수정',
    description: '한줄평 삭제',
  })
  @ApiSuccessResponse(DetailResponseDto, {
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
  ): Promise<DetailResponseDto> {
    return this.commentService.commentUpdate(user, dto, uuid);
  }

  @Patch('/:uuid')
  @ApiOperation({
    summary: '한줄평 삭제',
    description: '한줄평 삭제',
  })
  @ApiSuccessResponse(DetailResponseDto, {
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
  ): Promise<DetailResponseDto> {
    return this.commentService.commentDelete(user, uuid);
  }
}
