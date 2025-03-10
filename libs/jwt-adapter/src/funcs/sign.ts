import * as jose from 'jose';
import * as jwt from 'jsonwebtoken';

import type { JWTOptions, JWTPayload } from '../adapter';

export async function sign({
  secret,
  library,
  payload,
  options
}: {
  secret: string;
  library: 'jsonwebtoken' | 'jose';
  payload: JWTPayload;
  options: JWTOptions;
}): Promise<string> {
  switch (library) {
    case 'jsonwebtoken': {
      const jwtOptions: jwt.SignOptions = {
        algorithm: options.alg as jwt.Algorithm,
        header: { alg: options.alg, typ: options.typ }
      };
      if (options.exp) {
        jwtOptions.expiresIn = options.exp;
      }

      return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, jwtOptions, (err, token) => {
          if (err) {
            reject(err);
          } else {
            resolve(token as string);
          }
        });
      });
    }

    case 'jose': {
      const encoder = new TextEncoder();
      const jwtJose = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: options.alg, typ: options.typ })
        .setIssuedAt()
        .setExpirationTime(options.exp)
        .sign(encoder.encode(secret));
      return jwtJose;
    }
    default:
      throw new Error(`unsupported jwt library: ${library}`);
  }
}
