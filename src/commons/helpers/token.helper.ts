import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from 'src/config/config.service';

export function generateAccessToken(payload: any, configService: ConfigService): string {
  return jwt.sign(payload, String(configService.get('JWT_SECRET')), {
    expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')
      ? Number(configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'))
      : '1h',
  });
}

export function generateRefreshToken(userId: number, configService: ConfigService): string {
  return jwt.sign({}, String(configService.get('JWT_REFRESH_KEY')), {
    expiresIn: configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
      ? Number(configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'))
      : '14d',
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
    now.getDate() + parseInt(configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DATE'), 10) / 1000,
  );
  res.cookie('refresh_token', refreshToken, {
    expires: now,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
}
