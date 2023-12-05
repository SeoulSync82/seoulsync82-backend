import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { ErrorsInterceptor } from 'src/commons/interceptors/error.interceptor';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { BadWordsPipe } from 'src/commons/pipe/badwords.pipe';
import { UpdateUserDto } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('사용자')
@Controller('/api/user')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('/profile/:uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '프로필 수정',
    description: '프로필 수정',
  })
  @ApiResponse({
    status: 200,
    description: '프로필 수정',
    type: DetailResponseDto,
  })
  async profileUpdate(@Body(BadWordsPipe) dto: UpdateUserDto, @CurrentUser() user) {
    return await this.userService.profileUpdate(dto, user);
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
    example:
      '승모 - 2871948cc25b589ea0a672a6f060fae3 / 지영 - e89998f44b9450ec96664c295f3d701d / 윤진 - 84264400b65f57dcbc134231cd5e2611',
  })
  async getAccessToken(@Param('uuid') uuid: string): Promise<DetailResponseDto> {
    return await this.userService.getAccessToken(uuid);
  }
}
