import { Body, Controller, Get, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ERROR } from 'src/commons/constants/error';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { BadWordsPipe } from 'src/commons/pipe/badwords.pipe';
import { UuidResponseDto } from '../commons/dtos/uuid-response.dto';
import { ApiUserGetProfileResponseDto } from './dto/api-user-get-profile-response.dto';
import { ApiUserGetTokenResponseDto } from './dto/api-user-get-token-response.dto';
import { ApiUserPutUpdateRequestBodyDto } from './dto/api-user-put-update-request-body.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('사용자')
@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('/profile/:uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '프로필 수정',
    description: '프로필 수정',
  })
  @ApiSuccessResponse(UuidResponseDto, {
    description: '프로필 수정 성공',
    status: HttpStatus.NO_CONTENT,
  })
  async profileUpdate(
    @Body(BadWordsPipe) dto: ApiUserPutUpdateRequestBodyDto,
    @CurrentUser() user: UserDto,
  ): Promise<UuidResponseDto> {
    return await this.userService.profileUpdate(dto, user);
  }

  @Get('/token/:uuid')
  @ApiOperation({
    summary: 'Test - access_token 발급',
    description: 'Test - access_token 발급',
  })
  @ApiSuccessResponse(ApiUserGetTokenResponseDto, {
    status: HttpStatus.OK,
    description: 'Test - access_token 발급',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: 'uuid',
    example: '진리 - 9c3fd458bd5355dea4e649e3db77cfde / 승모 - 2871948cc25b589ea0a672a6f060fae3',
  })
  async getAccessToken(@Param('uuid') uuid: string): Promise<ApiUserGetTokenResponseDto> {
    return await this.userService.getAccessToken(uuid);
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '유저 프로필 조회',
    description: '유저 프로필 조회',
  })
  @ApiSuccessResponse(ApiUserGetProfileResponseDto, {
    description: '유저 프로필 조회 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '유저 uuid가 없을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  async getProfile(@CurrentUser() user: UserDto): Promise<ApiUserGetProfileResponseDto> {
    return await this.userService.getProfile(user);
  }
}
