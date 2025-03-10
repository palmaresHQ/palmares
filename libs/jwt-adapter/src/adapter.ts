import { authAdapter } from '@palmares/auth';

import { sign } from './funcs/sign';
import { verify } from './funcs/verify';

/**
 * Defines the structure of the payload used in JWT operations.
 */
export interface JWTPayload {
  /**
   * JWT Issuer
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1 RFC7519#section-4.1.1}
   */
  iss?: string;

  /**
   * JWT Subject
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2 RFC7519#section-4.1.2}
   */
  sub?: string;

  /**
   * JWT Audience
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3 RFC7519#section-4.1.3}
   */
  aud?: string | string[];

  /**
   * JWT ID
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7 RFC7519#section-4.1.7}
   */
  jti?: string;

  /**
   * JWT Not Before
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5 RFC7519#section-4.1.5}
   */
  nbf?: number;

  /**
   * JWT Expiration Time
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4 RFC7519#section-4.1.4}
   */
  exp?: number;

  /**
   * JWT Issued At
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6 RFC7519#section-4.1.6}
   */
  iat?: number;

  /** Any other JWT Claim Set member. */
  [propName: string]: unknown;
}

/**
 * Enumerates the supported JWT signing algorithms.
 */
export type JWTAlgorithm =
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'PS256'
  | 'PS384'
  | 'PS512';

/**
 * Defines the options for JWT operations.
 */
export interface JWTOptions {
  alg: JWTAlgorithm;
  typ?: 'JWT';
  exp: number; // in seconds
}

/**
 * Provides JWT authentication methods such as signing and verifying tokens.
 * We recommend using the 'jose' library for JWT operations due to its comprehensive support for modern JWT standards.
 * Please refer to the documentation in `@palmares/auth` for more details on adapter implementations.
 *
 * Warning: Ensure that the `secret` provided is securely stored and managed to prevent security vulnerabilities.
 */
export const jwtAdapter = authAdapter(
  ({ secret, library = 'jose' }: { secret: string; library?: 'jsonwebtoken' | 'jose' }) => ({
    name: 'jwt',
    methods: {
      sign: (payload: JWTPayload, options: JWTOptions) =>
        sign({
          secret,
          library,
          payload,
          options
        }),
      verify: (token: string, options: object) =>
        verify({
          secret,
          library,
          token,
          options
        })
    }
  })
);
