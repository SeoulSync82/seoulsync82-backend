import { Request, Response } from 'express';

export interface IAuthUser {
  user?: {
    role: string;
    email: string;
    id: string;
    exp: number;
  };
}

export interface IContext {
  req: Request & IAuthUser;
  res: Response;
}
