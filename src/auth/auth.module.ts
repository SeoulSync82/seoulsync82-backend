import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from 'src/auth/strategies/jwt-strategy';
import { ConfigModule } from 'src/config/config.module';
import { UserEntity } from 'src/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGoogleStrategy } from './strategies/jwt-social-google.strategy';
import { JwtKakaoStrategy } from './strategies/jwt-social-kakao.strategy';
import { JwtNaverStrategy } from './strategies/jwt-social-naver.strategy';

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
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
