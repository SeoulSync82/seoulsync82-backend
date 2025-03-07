import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkModule } from 'src/bookmark/bookmark.module';
import { CommunityController } from 'src/community/community.controller';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { CommunityService } from 'src/community/community.service';
import { CourseModule } from 'src/course/course.module';
import { CommunityEntity } from 'src/entities/community.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { ReactionModule } from 'src/reaction/reaction.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
    forwardRef(() => ReactionModule),
    forwardRef(() => CourseModule),
    forwardRef(() => BookmarkModule),
    NotificationModule,
    TypeOrmModule.forFeature([CommunityEntity]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, CommunityQueryRepository],
  exports: [CommunityQueryRepository],
})
export class CommunityModule {}
