import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CourseModule } from '../course/course.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { CommentQueryRepository } from './comment.query.repository';
import { CommunityModule } from '../community/community.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, CourseModule, CommunityModule, TypeOrmModule.forFeature([CommentEntity])],
  controllers: [CommentController],
  providers: [CommentService, CommentQueryRepository],
})
export class CommentModule {}
