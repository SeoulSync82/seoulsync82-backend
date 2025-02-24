import * as JWT from 'jsonwebtoken';

/** Authorization 헤더에서 토큰 파싱 */
export function parseAuthHeader(hdrValue: string): { scheme: string; value: string } | null {
  if (typeof hdrValue !== 'string') return null;
  const matches = hdrValue.match(/(\S+)\s+(\S+)/);
  return matches ? { scheme: matches[1], value: matches[2] } : null;
}

/** JWT 검증 유틸 */
export function verifyJWT<T>(
  token: string,
  secretKey: string,
  options?: JWT.VerifyOptions,
): Promise<T> {
  return new Promise((resolve, reject) => {
    JWT.verify(token, secretKey, options, (err, payload) => {
      if (err) reject(err);
      else resolve(payload as T);
    });
  });
}
