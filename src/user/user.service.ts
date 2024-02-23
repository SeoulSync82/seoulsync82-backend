import { Injectable, NotFoundException } from '@nestjs/common';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { ConfigService } from 'src/config/config.service';
import { UserQueryRepository } from './user.query.repository';
import * as jwt from 'jsonwebtoken';
import { isEmpty } from 'class-validator';
import { ERROR } from 'src/auth/constants/error';
import { plainToInstance } from 'class-transformer';
import { ApiUserGetProfileResponseDto } from './dto/api-user-get-profile-response.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly configService: ConfigService,
  ) {}

  async getUser(getUserInputDto) {
    const data = 0;
    return data;
  }

  async getAccessToken(uuid): Promise<DetailResponseDto> {
    const user = await this.userQueryRepository.findOne(uuid);
    const payload = {
      id: user.id,
      uuid: user.uuid,
      nickname: user.name,
      profile_image: user.profile_image,
    };
    const access_token = jwt.sign(payload, this.configService.get('JWT_SECRET'), {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });

    const result = Object.assign(payload, { access_token: access_token });

    return DetailResponseDto.from(result);
  }

  async profileUpdate(dto, user) {
    if (dto.name || dto.profile_image) {
      const updateUser = await this.userQueryRepository.updateUser(dto, user);
    }
    return DetailResponseDto.uuid(user.uuid);
  }

  async getProfile(user) {
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
