import { InjectRepository } from '@nestjs/typeorm';
import { MyCourseEntity } from 'src/entities/my_course.entity';
import { IsNull, LessThan, Repository } from 'typeorm';

export class MyCourseQueryRepository {
  constructor(
    @InjectRepository(MyCourseEntity)
    private repository: Repository<MyCourseEntity>,
  ) {}

  async find(dto, user): Promise<MyCourseEntity[]> {
    const whereConditions = { user_uuid: user.uuid, archived_at: IsNull() };

    if (dto.last_id > 0) {
      Object.assign(whereConditions, { id: LessThan(dto.last_id) });
    }

    return await this.repository.find({
      where: whereConditions,
      order: { created_at: 'DESC' },
      take: dto.size,
    });
  }

  async findOne(uuid): Promise<MyCourseEntity> {
    return await this.repository.findOne({
      where: { uuid: uuid, archived_at: IsNull() },
    });
  }
}
