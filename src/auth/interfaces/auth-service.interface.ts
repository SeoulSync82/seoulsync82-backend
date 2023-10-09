import { Response, Request } from 'express';
import { IAuthUser } from 'src/commons/type/context';
import { UserEntity } from 'src/entites/user.entity';

export interface IAuthServiceGetAccessToken {
  user: UserEntity | IAuthUser['user'];
}

export interface IAuthServiceSetRefreshToken {
  user: UserEntity;
  res: Response;
  req: Request;
}