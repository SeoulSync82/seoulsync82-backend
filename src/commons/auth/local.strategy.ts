// import { Injectable } from "@nestjs/common";
// import { PassportStrategy } from "@nestjs/passport";
// import { Strategy } from "passport-google-oauth20";
// import { AuthService } from "src/auth/auth.service";
// import { ValidateAuthOutputDto } from "src/auth/dto/validate-auth.dto";
// import { UserEntity } from "src/entites/user.entity";
// import { plainToClass } from 'class-transformer';
// import { ConfigService } from "src/config/config.service";

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private readonly authService: AuthService,
//     // private readonly configService:ConfigService,
//     ) {
//     super({ usernameField: 'email' });
//     // super({  
//     // clientID: configService.get('GOOGLE_ID'), //.env파일에 들어있음
//     //   clientSecret: configService.get('GOOGLE_SECRET'), //.env파일에 들어있음
//     //   callbackURL: 'http://localhost:3456/auth/google/callback', //.env파일에 들어있음
//     //   scope: ["email", "profile"],
//     // });
//   }

//   async validate(email: string) {
//     try {
//       console.log(email)
//       const result = await this.authService.validateUser({email});
//       const { ok, error } = result;
//       let { data: user } = result;
//       if (ok === false) return { ok: false, error };
//       if (!user) {
//         return { ok: false, error: '로그인 인증에 실패하였습니다.' };
//       }
//       // const plainUser = user.toJSON();
//       // user = plainToClass(UserEntity, plainUser);
//       return { ok: true, data: user };
//     } catch (error) {
//       console.log(error);
//       return { ok: false, error: '로그인 인증에 실패하였습니다.' };
//     }
//   }
// }