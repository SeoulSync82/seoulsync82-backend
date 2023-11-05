import { Controller, Get, Param, Post, Put, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { ErrorsInterceptor } from 'src/commons/interceptors/error.interceptor';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { UserService } from './user.service';

@ApiTags('사용자')
@Controller('/api/user')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('/profile/:uuid')
  @ApiOperation({
    summary: '프로필 수정',
    description: '프로필 수정',
  })
  async profileUpdate() {
    return 1;
  }

  @Get('/token/:uuid')
  @ApiOperation({
    summary: 'Test - eid_access_token 발급',
    description: 'Test - eid_access_token 발급',
  })
  @ApiResponse({
    status: 200,
    description: 'Test - eid_access_token 발급',
    type: DetailResponseDto,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: 'uuid',
    example: '84264400b65f57dcbc134231cd5e2611',
  })
  async getAccessToken(@Param('uuid') uuid: string): Promise<DetailResponseDto> {
    return await this.userService.getAccessToken(uuid);
  }
}
