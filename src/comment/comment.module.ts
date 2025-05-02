import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from 'src/comment/comment.controller';
import { CommentQueryRepository } from 'src/comment/comment.query.repository';
import { CommentService } from 'src/comment/comment.service';
import { CommunityModule } from 'src/community/community.module';
import { CourseModule } from 'src/course/course.module';
import { CommentEntity } from 'src/entities/comment.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
    CourseModule,
    forwardRef(() => CommunityModule),
    NotificationModule,
    TypeOrmModule.forFeature([CommentEntity]),
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentQueryRepository],
  exports: [CommentQueryRepository],
})
export class CommentModule {}
