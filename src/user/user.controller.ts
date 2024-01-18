import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ERROR } from 'src/auth/constants/error';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { BadWordsPipe } from 'src/commons/pipe/badwords.pipe';
import { ApiUserUpdatePutRequestBodyDto } from './dto/api-user-update-put-request-body.dto';
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
  @ApiSuccessResponse(DetailResponseDto, {
    description: '프로필 수정 성공',
    status: HttpStatus.NO_CONTENT,
  })
  async profileUpdate(
    @Body(BadWordsPipe) dto: ApiUserUpdatePutRequestBodyDto,
    @CurrentUser() user,
  ) {
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

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '유저 프로필 조회',
    description: '유저 프로필 조회',
  })
  @ApiSuccessResponse(DetailResponseDto, {
    description: '유저 프로필 조회 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '유저 uuid가 없을 경우' || '해당 유저 정보가 없을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  async getProfile(@CurrentUser() user) {
    return await this.userService.getProfile(user);
  }
}
