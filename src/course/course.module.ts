import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from 'src/entities/course.entity';
import { PlaceModule } from 'src/place/place.module';
import { CourseController } from './course.controller';
import { CourseQueryRepository } from './course.query.repository';
import { CourseService } from './course.service';

@Module({
  imports: [PlaceModule, TypeOrmModule.forFeature([CourseEntity])],
  controllers: [CourseController],
  providers: [CourseService, CourseQueryRepository],
})
export class CourseModule {}
