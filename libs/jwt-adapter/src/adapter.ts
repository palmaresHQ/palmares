import { authAdapter } from '@palmares/auth';

import { SignJwt, VerifyJwt, base64UrlDecode, base64UrlEncode, createSignature, getJwtSecret } from './utils/jwt-utils';

import type { JwtHeader, JwtPayload, VerifyOptions } from './types/jwt';

export type JwtAdapterConfig = {
  secret: string;
  algorithm?: JwtHeader['alg'];
  issuer?: string;
  audience?: string;
  expiresIn?: string | number;
  includeIssuedAt?: boolean;
  clockTolerance?: number;
  maxTokenAge?: string | number;
  subject?: string;
  typ?: JwtHeader['typ'];
};

/**
 * JWT adapter for Palmares authentication system
 * Provides JWT classes for token signing and verification with a fluent API
 *
 * @example
 * ```typescript
 * // Sign a token
 * const token = await new auth.jwt.signJWT({ userId: '123' })
 *   .setIssuedAt()
 *   .setExpirationTime('1h')
 *   .sign(secret);
 *
 * // Verify a token
 * const payload = await new auth.jwt.verifyJWT(token)
 *   .setAlgorithms(['HS256'])
 *   .verify(secret);
 * ```
 */
export const jwtAdapter = authAdapter((config: JwtAdapterConfig) => ({
  name: 'jwt',
  methods: {
    SignJwt,
    VerifyJwt,
    base64UrlDecode,
    base64UrlEncode,
    createSignature,
    getJwtSecret
  }
}));

// Export types for use in other parts of the application
export type { JwtHeader, JwtPayload, VerifyOptions };
