import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PlaceModule } from './place/place.module';
import { CourseModule } from './course/course.module';
import { ReactionModule } from './reaction/reaction.module';
import { NotificationModule } from './notification/notification.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigService } from './config/config.service';
import Joi from 'joi';
// import { JwtAccessStrategy } from './commons/auth/jwt-access.strategy';
// import { JwtRefreshStrategy } from './commons/auth/jwt-refresh.strategy';
import { SearchModule } from './search/search.module';
import { ThemeModule } from './theme/theme.module';
import { MyCourseModule } from './my_course/my_course.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      return {
        type: configService.get('DB_TYPE'),
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/entities/**.entity{.ts,.js}'],
        logging: true,
        synchronize: false,
        keepConnectionAlive: true,
        timezone: 'z',
      } as TypeOrmModuleAsyncOptions;
    },
  }),
  UserModule, PlaceModule, CourseModule, ReactionModule, NotificationModule, AuthModule, SearchModule, ThemeModule, MyCourseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
