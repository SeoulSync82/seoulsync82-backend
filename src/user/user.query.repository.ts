import { InjectRepository } from '@nestjs/typeorm';
import { SocialUser } from 'src/auth/interfaces/auth.interface';
import { UserEntity } from 'src/entities/user.entity';
import { ApiUserPutUpdateRequestBodyDto } from 'src/user/dto/api-user-put-update-request-body.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { In, Repository, UpdateResult } from 'typeorm';

export class UserQueryRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findUser(user: SocialUser): Promise<UserEntity> {
    return this.repository.findOne({
      where: { email: user.email, type: user.type },
    });
  }

  async createUser(user: SocialUser, uuid: string): Promise<UserEntity> {
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

  async save(userEntity: UserEntity): Promise<UserEntity> {
    return this.repository.save(userEntity);
  }

  async findId(id: number): Promise<UserEntity> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findOne(uuid: string): Promise<UserEntity> {
    return this.repository.findOne({
      where: { uuid },
    });
  }

  async profileUpdate(dto: ApiUserPutUpdateRequestBodyDto, user: UserDto): Promise<UpdateResult> {
    const updateFields: Partial<ApiUserPutUpdateRequestBodyDto> = {};

    if (dto.name) updateFields.name = dto.name;
    if (dto.profile_image) updateFields.profile_image = dto.profile_image;

    return this.repository.update({ id: user.id }, updateFields);
  }

  async findUserList(uuids: string[]): Promise<UserEntity[]> {
    return this.repository.find({
      where: { uuid: In(uuids) },
    });
  }
}
