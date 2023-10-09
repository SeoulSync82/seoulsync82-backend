import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { UserEntity } from 'src/entites/user.entity';
import { UserQueryRepository } from './user.query.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly configService: ConfigService,
  ) {}

  async getUser(getUserInputDto){
    // const user = UserEntity
    const data = 0
    return data
  }
}
