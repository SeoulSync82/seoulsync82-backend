import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { isEmpty } from 'class-validator';
import { ERROR } from 'src/commons/constants/error';
import { ConfigService } from 'src/config/config.service';
import { UuidResponseDto } from '../commons/dtos/uuid-response.dto';
import { generateAccessToken } from '../commons/helpers/token.helper';
import { ApiUserGetProfileResponseDto } from './dto/api-user-get-profile-response.dto';
import { ApiUserGetTokenResponseDto } from './dto/api-user-get-token-response.dto';
import { ApiUserPutUpdateRequestBodyDto } from './dto/api-user-put-update-request-body.dto';
import { UserDto } from './dto/user.dto';
import { UserQueryRepository } from './user.query.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly configService: ConfigService,
  ) {}

  async getAccessToken(uuid: string): Promise<ApiUserGetTokenResponseDto> {
    const user = await this.userQueryRepository.findOne(uuid);
    const payload = {
      id: user.id,
      uuid: user.uuid,
      nickname: user.name,
      profile_image: user.profile_image,
    };

    const apiUserGetTokenResponseDto: ApiUserGetTokenResponseDto = plainToInstance(
      ApiUserGetTokenResponseDto,
      payload,
      { excludeExtraneousValues: true },
    );

    apiUserGetTokenResponseDto.access_token = generateAccessToken(payload, this.configService);

    return apiUserGetTokenResponseDto;
  }

  async profileUpdate(
    dto: ApiUserPutUpdateRequestBodyDto,
    user: UserDto,
  ): Promise<UuidResponseDto> {
    if (dto.name || dto.profile_image) {
      await this.userQueryRepository.updateUser(dto, user);
    }
    return { uuid: user.uuid };
  }

  async getProfile(user: UserDto): Promise<ApiUserGetProfileResponseDto> {
    if (isEmpty(user.uuid)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }
    const userProfile = await this.userQueryRepository.findOne(user.uuid);
    if (isEmpty(userProfile)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const apiUserProfileGetResponseDto = plainToInstance(
      ApiUserGetProfileResponseDto,
      userProfile,
      { excludeExtraneousValues: true },
    );

    return apiUserProfileGetResponseDto;
  }
}
