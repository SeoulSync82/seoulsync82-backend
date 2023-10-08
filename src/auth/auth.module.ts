import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtRefreshStrategy } from "src/commons/auth/jwt-refresh.strategy";
import { AuthController } from "./auth.controller";
import { JwtGoogleStrategy } from "src/commons/auth/jwt-social-google.strategy";
import { JwtNaverStrategy } from "src/commons/auth/jwt-social-naver.strategy";
import { JwtKakaoStrategy } from "src/commons/auth/jwt-social-kakao.strategy";
import { UserService } from "src/user/user.service";
import { UserEntity } from "src/entites/user.entity";
import { JwtAccessStrategy } from "src/commons/auth/jwt-access.strategy";
import { ConfigModule } from "src/config/config.module";
import { ConfigService } from "src/config/config.service";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      UserEntity, //
    ]),
    CacheModule.register(),
  ],
  providers: [
    JwtAccessStrategy, //accessToken
    JwtRefreshStrategy, //refreshToken
    JwtGoogleStrategy, //google소셜로그인
    JwtNaverStrategy, //naver소셜로그인
    JwtKakaoStrategy, //kakao소셜로그인
    AuthResolver, //resolver 주입
    AuthService, //service 주입
    UserService, //user폴더의 service 주입
  ],
  controllers: [
    AuthController, //컨트롤러 주입
  ],
})
export class AuthModule {}