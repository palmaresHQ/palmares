import * as jose from 'jose';
import * as jwt from 'jsonwebtoken';

/**
 * Verifies a JWT token using the specified library and options.
 *
 * @param {string} secret - The secret key used to verify the JWT.
 * @param {'jsonwebtoken' | 'jose'} library - The library to use for verification ('jsonwebtoken' or 'jose').
 * @param {string} token - The JWT token to verify.
 * @param {object} options - The options to pass to the JWT verification function.
 * @returns {Promise<object>} A promise that resolves with the decoded token payload if verification is successful.
 * @throws {Error} If the specified library is not supported or if verification fails.
 */
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
