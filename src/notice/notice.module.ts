import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeEntity } from 'src/entities/notice.entity';
import { NoticeQueryRepository } from 'src/notice/notice.query.repository';
import { NoticeController } from './notice.controller';
import { NoticeService } from './notice.service';

@Module({
  imports: [TypeOrmModule.forFeature([NoticeEntity])],
  controllers: [NoticeController],
  providers: [NoticeService, NoticeQueryRepository],
})
export class NoticeModule {}
