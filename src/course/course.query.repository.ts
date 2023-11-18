import { InjectRepository } from '@nestjs/typeorm';
import { time } from 'console';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { Repository } from 'typeorm';

export class CourseQueryRepository {
  constructor(
    @InjectRepository(CourseEntity)
    private repository: Repository<CourseEntity>,
    @InjectRepository(CourseDetailEntity)
    private detailRepository: Repository<CourseDetailEntity>,
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
}
