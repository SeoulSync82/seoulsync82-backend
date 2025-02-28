import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { In, Repository } from 'typeorm';

export class UserQueryRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findUser(user): Promise<UserEntity> {
    return this.repository.findOne({
      where: { email: user.email, type: user.type },
    });
  }

  async createUser(user, uuid): Promise<UserEntity> {
    const userData = {
      ...user,
      photo: user.type === 'kakao' ? user.photo : null,
    };

    return this.repository.save({
      uuid,
      email: userData.email,
      name: userData.nickname,
      profile_image: userData.photo,
      type: userData.type,
    });
  }

  async save(userEntity): Promise<UserEntity> {
    return this.repository.save(userEntity);
  }

  async findId(id): Promise<UserEntity> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findOne(uuid): Promise<UserEntity> {
    return this.repository.findOne({
      where: { uuid },
    });
  }

  async updateUser(dto, user) {
    const whereConditions = {};
    if (dto.name) {
      Object.assign(whereConditions, { name: dto.name });
    }
    if (dto.profile_image) {
      Object.assign(whereConditions, { profile_image: dto.profile_image });
    }

    return this.repository.update({ id: user.id }, whereConditions);
  }

  async findUserList(uuids): Promise<UserEntity[]> {
    return this.repository.find({
      where: { uuid: In(uuids) },
    });
  }
}
