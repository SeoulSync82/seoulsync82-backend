import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyCourseEntity } from 'src/entities/my_course.entity';
import { MyCourseController } from './my_course.controller';
import { MyCourseQueryRepository } from './my_course.query.repository';
import { MyCourseService } from './my_course.service';

@Module({
  imports: [TypeOrmModule.forFeature([MyCourseEntity])],
  controllers: [MyCourseController],
  providers: [MyCourseService, MyCourseQueryRepository],
})
export class MyCourseModule {}
