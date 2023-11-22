import { InjectRepository } from '@nestjs/typeorm';
import { time } from 'console';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { MyCourseEntity } from 'src/entities/my_course.entity';
import { Repository } from 'typeorm';

export class CourseQueryRepository {
  constructor(
    @InjectRepository(CourseEntity)
    private repository: Repository<CourseEntity>,
    @InjectRepository(CourseDetailEntity)
    private detailRepository: Repository<CourseDetailEntity>,
    @InjectRepository(MyCourseEntity)
    private myCourseRepository: Repository<MyCourseEntity>,
  ) {}

  async saveCourse(courseEntity) {
    return await this.repository.save(courseEntity);
  }

  async saveCourseDetail(courseDetailEntity) {
    return await this.detailRepository
      .save(courseDetailEntity)
      .then(() => {
        console.log('Course details saved successfully');
      })
      .catch((error) => {
        console.error('Error saving course details:', error);
      });
  }

  async findUserHistoryCourse(uuid: string): Promise<CourseDetailEntity[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await this.detailRepository
      .createQueryBuilder('courseDetail')
      .innerJoin('courseDetail.course', 'course')
      .where('course.user_uuid = :uuid', { uuid })
      .andWhere('course.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .select('courseDetail.place_uuid')
      .getMany();
  }

  async saveMyCourse(myCourseEntity) {
    return await this, this.myCourseRepository.save(myCourseEntity);
  }
}
