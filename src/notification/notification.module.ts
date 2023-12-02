import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/entities/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationQueryRepository } from './notification.query.repository';
import { NotificationService } from './notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationQueryRepository],
})
export class NotificationModule {}
