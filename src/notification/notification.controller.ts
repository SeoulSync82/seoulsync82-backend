import { Controller, Get, Query, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { ResponseDataDto } from 'src/commons/dto/response.dto';
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
}
