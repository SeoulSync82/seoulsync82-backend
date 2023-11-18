import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from 'src/entities/course.entity';
import { Repository } from 'typeorm';

export class CourseQueryRepository {
  constructor(
    @InjectRepository(CourseEntity)
    private repository: Repository<CourseEntity>,
  ) {}
}
