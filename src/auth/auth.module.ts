import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtGoogleStrategy } from 'src/auth/strategies/jwt-social-google.strategy';
import { JwtKakaoStrategy } from 'src/auth/strategies/jwt-social-kakao.strategy';
import { JwtNaverStrategy } from 'src/auth/strategies/jwt-social-naver.strategy';
import { JwtStrategy } from 'src/auth/strategies/jwt-strategy';
import { ConfigModule } from 'src/config/config.module';
import { UserEntity } from 'src/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

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
