import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from 'src/config/config.service';

export function generateAccessToken(payload: any, configService: ConfigService): string {
  return jwt.sign(payload, configService.get('JWT_SECRET'), {
    expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
  });
}

export function generateRefreshToken(userId: number, configService: ConfigService): string {
  return jwt.sign({}, configService.get('JWT_REFRESH_KEY'), {
    expiresIn: configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    audience: String(userId),
  });
}

export function setRefreshCookie(
  res: Response,
  refreshToken: string,
  configService: ConfigService,
): void {
  const now = new Date();
  now.setDate(
    now.getDate() + parseInt(configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DATE')) / 1000,
  );
  res.cookie('refresh_token', refreshToken, {
    expires: now,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
}
