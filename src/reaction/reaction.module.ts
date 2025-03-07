import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityModule } from 'src/community/community.module';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { ReactionController } from 'src/reaction/reaction.controller';
import { ReactionQueryRepository } from 'src/reaction/reaction.query.repository';
import { ReactionService } from 'src/reaction/reaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReactionEntity]),
    NotificationModule,
    forwardRef(() => CommunityModule),
  ],
  controllers: [ReactionController],
  providers: [ReactionService, ReactionQueryRepository],
  exports: [ReactionQueryRepository],
})
export class ReactionModule {}
