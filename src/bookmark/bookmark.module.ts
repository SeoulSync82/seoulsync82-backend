import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkController } from 'src/bookmark/bookmark.controller';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { CommunityModule } from 'src/community/community.module';
import { CourseModule } from 'src/course/course.module';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { PlaceModule } from 'src/place/place.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    forwardRef(() => CourseModule),
    UserModule,
    PlaceModule,
    forwardRef(() => CommunityModule),
    TypeOrmModule.forFeature([BookmarkEntity]),
  ],
  controllers: [BookmarkController],
  providers: [BookmarkService, BookmarkQueryRepository],
  exports: [BookmarkQueryRepository],
})
export class BookmarkModule {}
