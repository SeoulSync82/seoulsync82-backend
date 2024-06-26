import { Request } from 'express';
import { ValidateAuthOutputDto } from '../dto/api-auth-validate.dto';

/* Local Login Strategy */
export type RequestWithUserData = Request & { user: ValidateAuthOutputDto };

/* JWT Strategy */
export interface Payload {
  id: number;
}

/* Google Strategy */
type GoogleUser = {
  email: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  photo: string;
  type: string;
};

export type GoogleRequest = Request & { user: GoogleUser };

/* Kakao Strategy */
type KakaoUser = {
  email: string;
  nickname: string;
  photo: string;
  type: string;
};

export type KakaoRequest = Request & { user: KakaoUser };

type NaverUser = {
  email: string;
  nickname: string;
  photo: string;
  type: string;
};

export type NaverRequest = Request & { user: NaverUser };
