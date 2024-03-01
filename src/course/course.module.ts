import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { PlaceModule } from 'src/place/place.module';
import { CourseController } from './course.controller';
import { CourseQueryRepository } from './course.query.repository';
import { CourseService } from './course.service';
import { UserModule } from 'src/user/user.module';
import { BookmarkModule } from 'src/bookmark/bookmark.module';
import { CommunityModule } from 'src/community/community.module';
import { SubwayModule } from 'src/subway/subway.module';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [
    ConfigModule,
    SubwayModule,
    forwardRef(() => BookmarkModule),
    forwardRef(() => CommunityModule),
    UserModule,
    PlaceModule,
    TypeOrmModule.forFeature([CourseEntity, CourseDetailEntity, BookmarkEntity]),
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseQueryRepository],
  exports: [CourseQueryRepository],
})
export class CourseModule {}
