import { Module } from '@nestjs/common';
import { ReactionController } from 'src/reaction/reaction.controller';
import { ReactionService } from 'src/reaction/reaction.service';

@Module({
  controllers: [ReactionController],
  providers: [ReactionService],
})
export class ReactionModule {}
