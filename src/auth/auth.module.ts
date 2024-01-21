import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { AuthResolver } from "./auth.resolver";
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtGoogleStrategy } from 'src/commons/auth/jwt-social-google.strategy';
import { JwtNaverStrategy } from 'src/commons/auth/jwt-social-naver.strategy';
import { JwtKakaoStrategy } from 'src/commons/auth/jwt-social-kakao.strategy';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/entities/user.entity';
import { ConfigModule } from 'src/config/config.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from 'src/user/user.module';
import { JwtGoogleDevStrategy } from 'src/commons/auth/jwt-social-google-dev.strategy';
import { JwtKakaoDevStrategy } from 'src/commons/auth/jwt-social-kakao-dev.strategy';
import { JwtNaverDevStrategy } from 'src/commons/auth/jwt-social-naver-dev.strategy';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserEntity]),
    CacheModule.register(),
  ],
  providers: [
    JwtGoogleStrategy,
    JwtNaverStrategy,
    JwtKakaoStrategy,
    AuthService,
    UserService,
    JwtGoogleDevStrategy,
    JwtKakaoDevStrategy,
    JwtNaverDevStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
