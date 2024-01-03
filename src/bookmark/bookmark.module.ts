import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from 'src/course/course.module';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { PlaceModule } from 'src/place/place.module';
import { UserModule } from 'src/user/user.module';
import { BookmarkController } from './bookmark.controller';
import { BookmarkQueryRepository } from './bookmark.query.repository';
import { BookmarkService } from './bookmark.service';

@Module({
  imports: [UserModule, PlaceModule, CourseModule, TypeOrmModule.forFeature([BookmarkEntity])],
  controllers: [BookmarkController],
  providers: [BookmarkService, BookmarkQueryRepository],
  exports: [BookmarkQueryRepository],
})
export class BookmarkModule {}
