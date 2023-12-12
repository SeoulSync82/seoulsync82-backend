import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/entities/notification.entity';
import { UserModule } from 'src/user/user.module';
import { NotificationController } from './notification.controller';
import { NotificationQueryRepository } from './notification.query.repository';
import { NotificationService } from './notification.service';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationQueryRepository],
  exports: [NotificationQueryRepository],
})
export class NotificationModule {}
