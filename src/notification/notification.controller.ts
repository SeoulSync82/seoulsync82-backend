import {
  Controller,
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
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { NotificationListReqDto } from './dto/notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('알림')
@Controller('/api/notification')
@UseInterceptors(SuccessInterceptor)
@UseFilters(SeoulSync82ExceptionFilter)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/')
  @ApiOperation({
    summary: '알림 목록',
    description: '알림 목록',
  })
  @ApiResponse({
    status: 200,
    description: '알림 목록',
    type: ResponseDataDto,
  })
  async notificationList(
    @Query() dto: NotificationListReqDto,
    @CurrentUser() user,
  ): Promise<ResponseDataDto> {
    return await this.notificationService.notificationList(dto, user);
  }

  @Post('/:uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '알림 읽음 처리 ',
    description: '알림 읽음 처리 ',
  })
  @ApiResponse({
    status: 200,
    description: '알림 읽음 처리',
    type: DetailResponseDto,
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
