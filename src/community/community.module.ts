import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from 'src/course/course.module';
import { CommunityEntity } from 'src/entities/community.entity';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { MyCourseModule } from 'src/my_course/my_course.module';
import { NotificationModule } from 'src/notification/notification.module';
import { CommunityController } from './community.controller';
import { CommunityQueryRepository } from './community.query.repository';
import { CommunityService } from './community.service';
import { ReactionQueryRepository } from './reaction.query.repository';

@Module({
  imports: [
    CourseModule,
    MyCourseModule,
    NotificationModule,
    TypeOrmModule.forFeature([CommunityEntity, ReactionEntity]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, CommunityQueryRepository, ReactionQueryRepository],
})
export class CommunityModule {}
