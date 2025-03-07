import {
  Controller,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ERROR } from 'src/commons/constants/error';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { NotificationInterceptor } from 'src/commons/interceptors/notification.interceptor';
import { ReactionService } from 'src/reaction/reaction.service';
import { UserDto } from 'src/user/dto/user.dto';

@ApiTags('리액션')
@Controller('api/reaction')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 코스 좋아요',
    description: '커뮤니티 코스 좋아요',
  })
  @ApiSuccessResponse(UuidResponseDto, {
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
  ): Promise<UuidResponseDto> {
    const res = await this.reactionService.reactionToCommunity(user, uuid);
    req.notification = res.notification;
    return res.data;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 코스 좋아요 취소',
    description: '커뮤니티 코스 좋아요 취소',
  })
  @ApiSuccessResponse(UuidResponseDto, {
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
  ): Promise<UuidResponseDto> {
    return this.reactionService.reactionDeleteToCommunity(user, uuid);
  }
}
