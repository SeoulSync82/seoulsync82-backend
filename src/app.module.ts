import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PlaceModule } from './place/place.module';
import { CourseModule } from './course/course.module';

@Module({
  imports: [UserModule, PlaceModule, CourseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
