import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from 'src/course/course.module';
import { MyCourseEntity } from 'src/entities/my_course.entity';
import { PlaceModule } from 'src/place/place.module';
import { UserModule } from 'src/user/user.module';
import { MyCourseController } from './my_course.controller';
import { MyCourseQueryRepository } from './my_course.query.repository';
import { MyCourseService } from './my_course.service';

@Module({
  imports: [UserModule, PlaceModule, CourseModule, TypeOrmModule.forFeature([MyCourseEntity])],
  controllers: [MyCourseController],
  providers: [MyCourseService, MyCourseQueryRepository],
  exports: [MyCourseQueryRepository],
})
export class MyCourseModule {}
