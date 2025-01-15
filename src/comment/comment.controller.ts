import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  UseGuards,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../commons/auth/jwt-auth.guard';
import { SeoulSync82ExceptionFilter } from '../commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from '../commons/interceptors/success.interceptor';
import { ERROR } from '../auth/constants/error';
import { ApiExceptionResponse } from '../commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from '../commons/decorators/api-success-response.decorator';
import { DetailResponseDto } from '../commons/dto/response.dto';
import { BadWordsPipe } from '../commons/pipe/badwords.pipe';
import { ApiCommentPostRequestBodyDto } from './dto/api-community-post-request-body.dto';
import { CurrentUser } from '../commons/decorators/user.decorator';
import { UserDto } from '../user/dto/user.dto';

@ApiTags('한줄평')
@Controller('/api/comment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(SuccessInterceptor)
@UseFilters(SeoulSync82ExceptionFilter)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

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
  ) {
    return await this.commentService.commentPost(uuid, user, dto);
  }

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
