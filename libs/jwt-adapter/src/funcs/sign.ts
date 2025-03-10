import * as jose from 'jose';
import * as jwt from 'jsonwebtoken';

import type { JWTOptions, JWTPayload } from '../adapter';

/**
 * Signs a JWT using the specified library and options.
 *
 * @param {string} secret - The secret key used for signing the JWT.
 * @param {'jsonwebtoken' | 'jose'} library - The library to use for signing ('jsonwebtoken' or 'jose').
 * @param {JWTPayload} payload - The payload to be included in the JWT.
 * @param {JWTOptions} options - The options to configure the JWT signing process.
 * @returns {Promise<string>} A promise that resolves with the signed JWT.
 * @throws {Error} If the specified library is not supported or if signing fails.
 */
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
      throw new Error(`Unsupported JWT library: ${library}`);
  }
}
