import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkModule } from 'src/bookmark/bookmark.module';
import { CommunityController } from 'src/community/community.controller';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { CommunityService } from 'src/community/community.service';
import { ReactionQueryRepository } from 'src/community/reaction.query.repository';
import { CourseModule } from 'src/course/course.module';
import { CommunityEntity } from 'src/entities/community.entity';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
    forwardRef(() => CourseModule),
    forwardRef(() => BookmarkModule),
    NotificationModule,
    TypeOrmModule.forFeature([CommunityEntity, ReactionEntity]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, CommunityQueryRepository, ReactionQueryRepository],
  exports: [CommunityQueryRepository, ReactionQueryRepository],
})
export class CommunityModule {}
