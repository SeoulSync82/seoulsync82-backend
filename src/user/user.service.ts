import { Injectable } from '@nestjs/common';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { ConfigService } from 'src/config/config.service';
import { UserEntity } from 'src/entities/user.entity';
import { resourceLimits } from 'worker_threads';
import { UserQueryRepository } from './user.query.repository';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly configService: ConfigService,
  ) {}

  async getUser(getUserInputDto) {
    // const user = UserEntity
    const data = 0;
    return data;
  }

  async getAccessToken(uuid): Promise<DetailResponseDto> {
    const user = await this.userQueryRepository.findOne(uuid);
    // accessToken 재발급
    const payload = {
      id: user.id,
      uuid: user.uuid,
      nickname: user.name,
      profile_image: user.profile_image,
    };
    const eid_access_token = jwt.sign(payload, this.configService.get('JWT_SECRET'), {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });

    const result = Object.assign(payload, { eid_access_token: eid_access_token });

    return DetailResponseDto.from(result);
  }

  async profileUpdate(dto, user) {
    if (dto.name || dto.profile_image) {
      const updateUser = await this.userQueryRepository.updateUser(dto, user);
    }
    return DetailResponseDto.uuid(user.uuid);
  }
}
