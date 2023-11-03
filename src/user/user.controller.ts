import { Controller, Get, Post, Put, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { ErrorsInterceptor } from 'src/commons/interceptors/error.interceptor';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';

@ApiTags('사용자')
@Controller('/api/user')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor, ErrorsInterceptor)
export class UserController {
  @Put('/profile/:uuid')
  @ApiOperation({
    summary: '프로필 수정',
    description: '프로필 수정',
  })
  async profileUpdate() {
    return 1;
  }
}
