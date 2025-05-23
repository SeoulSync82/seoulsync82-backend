import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkModule } from 'src/bookmark/bookmark.module';
import { CommunityModule } from 'src/community/community.module';
import { ConfigModule } from 'src/config/config.module';
import { CourseRecommendationService } from 'src/course/course-recommendation.service';
import { CourseController } from 'src/course/course.controller';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { CourseService } from 'src/course/course.service';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { PlaceModule } from 'src/place/place.module';
import { SubwayModule } from 'src/subway/subway.module';
import { ThemeModule } from 'src/theme/theme.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    ConfigModule,
    SubwayModule,
    forwardRef(() => BookmarkModule),
    forwardRef(() => CommunityModule),
    UserModule,
    ThemeModule,
    PlaceModule,
    TypeOrmModule.forFeature([CourseEntity, CourseDetailEntity, BookmarkEntity]),
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseRecommendationService, CourseQueryRepository],
  exports: [CourseQueryRepository],
})
export class CourseModule {}
