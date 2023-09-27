import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PlaceModule } from './place/place.module';
import { CourseModule } from './course/course.module';
import { ReactionModule } from './reaction/reaction.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [UserModule, PlaceModule, CourseModule, ReactionModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
