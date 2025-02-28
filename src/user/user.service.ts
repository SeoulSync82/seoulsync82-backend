import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { isEmpty } from 'class-validator';
import { ERROR } from 'src/commons/constants/error';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { generateAccessToken } from 'src/commons/helpers/token.helper';
import { ConfigService } from 'src/config/config.service';
import { ApiUserGetProfileResponseDto } from 'src/user/dto/api-user-get-profile-response.dto';
import { ApiUserGetTokenResponseDto } from 'src/user/dto/api-user-get-token-response.dto';
import { ApiUserPutUpdateRequestBodyDto } from 'src/user/dto/api-user-put-update-request-body.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';

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

    return plainToInstance(
      ApiUserGetTokenResponseDto,
      {
        ...payload,
        access_token: generateAccessToken(payload, this.configService),
      },
      { excludeExtraneousValues: true },
    );
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
    const userProfile = await this.userQueryRepository.findOne(user.uuid);
    if (isEmpty(userProfile)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    return plainToInstance(ApiUserGetProfileResponseDto, userProfile, {
      excludeExtraneousValues: true,
    });
  }
}
