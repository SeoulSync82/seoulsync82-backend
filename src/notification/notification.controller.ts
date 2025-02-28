import { Controller, Get, HttpStatus, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ERROR } from 'src/commons/constants/error';
import { ApiArrayLastItemIdSuccessResponse } from 'src/commons/decorators/api-array-last-item-id-success-response.decorator';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { ApiNotificationGetListRequestQueryDto } from 'src/notification/dto/api-notification-get-list-request-query.dto';
import { ApiNotificationGetListResponseDto } from 'src/notification/dto/api-notification-get-list-response.dto';
import { NotificationService } from 'src/notification/notification.service';
import { UserDto } from 'src/user/dto/user.dto';

@ApiTags('알림')
@Controller('/api/notification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/')
  @ApiOperation({
    summary: '알림 목록',
    description: '알림 목록',
  })
  @ApiArrayLastItemIdSuccessResponse(ApiNotificationGetListResponseDto, {
    description: '알림 목록 조회 성공',
    status: HttpStatus.OK,
  })
  async notificationList(
    @Query() dto: ApiNotificationGetListRequestQueryDto,
    @CurrentUser() user: UserDto,
  ): Promise<LastItemIdResponseDto<ApiNotificationGetListResponseDto>> {
    return this.notificationService.notificationList(dto, user);
  }

  @Patch('/:uuid')
  @ApiOperation({
    summary: '알림 읽음 처리 ',
    description: '알림 읽음 처리 ',
  })
  @ApiArraySuccessResponse(UuidResponseDto, {
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
    @CurrentUser() user: UserDto,
  ): Promise<UuidResponseDto> {
    return this.notificationService.notificationRead(uuid, user);
  }
}
