import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { In, Repository } from 'typeorm';

export class UserQueryRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findUser(user): Promise<UserEntity> {
    return await this.repository.findOne({
      where: { email: user.email, name: user.nickname, type: user.type },
    });
  }

  async createUser(user, uuid): Promise<UserEntity> {
    return await this.repository.save({
      uuid: uuid,
      email: user.email,
      name: user.nickname,
      profile_image: user.photo,
      type: user.type,
    });
  }

  async save(UserEntity): Promise<UserEntity> {
    return await this.repository.save(UserEntity);
  }

  async findId(id): Promise<UserEntity> {
    return await this.repository.findOne({
      where: { id: id },
    });
  }

  async findOne(uuid): Promise<UserEntity> {
    return await this.repository.findOne({
      where: { uuid: uuid },
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

    return await this.repository.update({ id: user.id }, whereConditions);
  }

  async findUserList(uuids) {
    return await this.repository.find({
      where: { uuid: In(uuids) },
    });
  }
}
