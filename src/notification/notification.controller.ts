import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ERROR } from 'src/auth/constants/error';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { ApiNotificationListGetRequestQueryDto } from './dto/api-notification-list-get-request-query.dto';
import { ApiNotificationListGetResponseDto } from './dto/api-notification-list-get-response.dto';
import { NotificationService } from './notification.service';

@ApiTags('알림')
@Controller('/api/notification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(SuccessInterceptor)
@UseFilters(SeoulSync82ExceptionFilter)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/')
  @ApiOperation({
    summary: '알림 목록',
    description: '알림 목록',
  })
  @ApiArraySuccessResponse(ApiNotificationListGetResponseDto, {
    description: '알림 목록 조회 성공',
    status: HttpStatus.OK,
  })
  async notificationList(@Query() dto: ApiNotificationListGetRequestQueryDto, @CurrentUser() user) {
    return await this.notificationService.notificationList(dto, user);
  }

  @Patch('/:uuid')
  @ApiOperation({
    summary: '알림 읽음 처리 ',
    description: '알림 읽음 처리 ',
  })
  @ApiArraySuccessResponse(DetailResponseDto, {
    description: '알림 읽음 처리 성공',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '존재하지 않는 알림 uuid 이거나 알림의 타겟이 유저가 아닐경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: true,
    example: 'ce9cee6288595607bb2720aa685d8f89',
    description: '읽음 처리 할 알림 uuid',
  })
  async notificationRead(
    @Param('uuid') uuid: string,
    @CurrentUser() user,
  ): Promise<DetailResponseDto> {
    return await this.notificationService.notificationRead(uuid, user);
  }
}
