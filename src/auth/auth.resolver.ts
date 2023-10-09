import {
  CACHE_MANAGER,
  Inject,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import {
  GqlAuthAccessGuard,
  GqlAuthRefreshGuard,
} from 'src/commons/auth/gql-auth.guard';
import { UserService } from '../user/user.service';
import * as jwt from 'jsonwebtoken';
import { Cache } from 'cache-manager';
import { IContext } from 'src/commons/type/context';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly userService: UserService, //
    private readonly authService: AuthService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // @Mutation(() => String)
  // async login(
  //   @Args('email') email: string, //
  //   @Args('password') password: string,
  //   @Context() context: IContext,
  // ): Promise<string> {
  //   const user = await this.userService.findOne({ email });

  //   if (!user) throw new UnprocessableEntityException('이메일이 없습니다.');

  //   const isAuth = await bcrypt.compare(password, user.password);
  //   if (!isAuth) throw new UnprocessableEntityException('암호가 틀렸습니다.');

  //   this.authService.setRefreshToken({
  //     user,
  //     res: context.res,
  //     req: context.req,
  //   });

  //   const result = this.authService.getAccessToken({ user });
  //   console.log(result);
  //   return result;
  // }

  // @UseGuards(GqlAuthRefreshGuard)
  // @Mutation(() => String)
  // restoreAccessToken(
  //   @Context() context: IContext, //
  // ): string {
  //   // accessToken(=JWT)을 만들어서 브라우저에 전달하기
  //   return this.authService.getAccessToken({ user: context.req.user });
  // }

  // @UseGuards(GqlAuthAccessGuard)
  // @Mutation(() => String)
  // async logout(
  //   @Context() context: IContext, //
  // ) {
  //   const refresh_token = context.req.headers.cookie.replace(
  //     'refreshToken=',
  //     '',
  //   );
  //   const access_token = context.req.headers.authorization.replace(
  //     'Bearer ',
  //     '',
  //   );
  //   console.log(refresh_token);

  //   try {
  //     const decoded = jwt.verify(access_token, process.env.JWT_ACCESS_KEY);
  //     await this.cacheManager.set(
  //       `access_token:${access_token}`,
  //       'accessToken',
  //       context.req.user.exp,
  //     );
  //     const decodedR = jwt.verify(refresh_token, process.env.JWT_REFRESH_KEY);

  //     await this.cacheManager.set(
  //       `refresh_token:${refresh_token}`,
  //       'refreshToken',
  //       context.req.user.exp,
  //     );
  //   } catch (error) {
  //     throw new UnauthorizedException('유효하지 않은 토큰입니다.');
  //   }

  //   return '로그아웃에 성공하였습니다.';
  // }
}
