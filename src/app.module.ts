import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PlaceModule } from './place/place.module';

@Module({
  imports: [UserModule, PlaceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
