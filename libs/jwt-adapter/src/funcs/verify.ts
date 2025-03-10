import * as jose from 'jose';
import * as jwt from 'jsonwebtoken';

export async function verify({
  secret,
  library,
  token,
  options
}: {
  secret: string;
  library: 'jsonwebtoken' | 'jose';
  token: string;
  options: object;
}) {
  switch (library) {
    case 'jsonwebtoken':
      return new Promise((resolve, reject) => {
        jwt.verify(token, secret, options, (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        });
      });
    case 'jose':
      try {
        const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(secret), options);
        return Promise.resolve(payload);
      } catch (error) {
        return Promise.reject(error);
      }
    default:
      throw new Error(`Unsupported JWT library: ${library}`);
  }
}
