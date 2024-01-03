import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from 'src/course/course.module';
import { CommunityEntity } from 'src/entities/community.entity';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { BookmarkModule } from 'src/bookmark/bookmark.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UserModule } from 'src/user/user.module';
import { CommunityController } from './community.controller';
import { CommunityQueryRepository } from './community.query.repository';
import { CommunityService } from './community.service';
import { ReactionQueryRepository } from './reaction.query.repository';

@Module({
  imports: [
    UserModule,
    CourseModule,
    BookmarkModule,
    NotificationModule,
    TypeOrmModule.forFeature([CommunityEntity, ReactionEntity]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, CommunityQueryRepository, ReactionQueryRepository],
})
export class CommunityModule {}
