import { InjectRepository } from '@nestjs/typeorm';
import { ApiCourseGetMyHistoryRequestQueryDto } from 'src/course/dto/api-course-get-my-history-request-query.dto';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { In, LessThan, Repository } from 'typeorm';

export class CourseQueryRepository {
  constructor(
    @InjectRepository(CourseEntity)
    private repository: Repository<CourseEntity>,
    @InjectRepository(CourseDetailEntity)
    private detailRepository: Repository<CourseDetailEntity>,
  ) {}

  async saveCourse(courseEntity: CourseEntity): Promise<CourseEntity> {
    return this.repository.save(courseEntity);
  }

  async saveCourseDetail(courseDetailEntity: CourseDetailEntity): Promise<CourseDetailEntity> {
    return this.detailRepository.save(courseDetailEntity);
  }

  async findUserHistoryCourse(uuid: string): Promise<CourseDetailEntity[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.detailRepository
      .createQueryBuilder('courseDetail')
      .innerJoin('courseDetail.course', 'course')
      .where('course.user_uuid = :uuid', { uuid })
      .andWhere('course.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .select('courseDetail.place_uuid')
      .getMany();
  }

  async findCourse(uuid: string): Promise<CourseEntity> {
    return this.repository.findOne({
      where: { uuid },
    });
  }

  async findPlace(courseUuid: string): Promise<CourseDetailEntity[]> {
    return this.detailRepository
      .createQueryBuilder('courseDetail')
      .leftJoinAndSelect('courseDetail.place', 'place')
      .where('courseDetail.course_uuid = :courseUuid', { courseUuid })
      .select(['courseDetail', 'place'])
      .getMany();
  }

  async findList(uuids: string[]): Promise<CourseEntity[]> {
    return this.repository.find({
      where: { uuid: In(uuids) },
    });
  }

  async findOne(uuid: string): Promise<CourseEntity> {
    return this.repository.findOne({
      where: { uuid },
    });
  }

  async findMyCourse(
    dto: ApiCourseGetMyHistoryRequestQueryDto,
    user: UserDto,
  ): Promise<CourseEntity[]> {
    const whereConditions = {
      user_uuid: user.uuid,
      ...(dto.last_id > 0 ? { id: LessThan(dto.last_id) } : {}),
    };

    return this.repository.find({
      where: whereConditions,
      order: { created_at: 'DESC' },
      take: dto.size,
    });
  }
}
