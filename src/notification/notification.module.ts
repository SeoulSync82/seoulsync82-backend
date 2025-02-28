import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/entities/notification.entity';
import { NotificationController } from 'src/notification/notification.controller';
import { NotificationQueryRepository } from 'src/notification/notification.query.repository';
import { NotificationService } from 'src/notification/notification.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationQueryRepository],
  exports: [NotificationQueryRepository],
})
export class NotificationModule {}
