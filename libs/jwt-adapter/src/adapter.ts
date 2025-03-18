import { authAdapter } from '@palmares/auth';

import { signJwt, verifyJwt } from './utils/jwt-utils';

import type { JwtHeader, JwtPayload, VerifyOptions } from './types/jwt';

/**
 * JWT adapter for Palmares authentication system
 * Provides methods for signing and verifying JWT tokens with a fluent API
 *
 * @example
 * ```typescript
 * // Sign a token
 * const token = await jwtAdapter.methods.signJwt({ userId: '123' })
 *   .setIssuedAt()
 *   .setExpirationTime('1h')
 *   .sign(secret);
 *
 * // Verify a token
 * const payload = await jwtAdapter.methods.verifyJwt(token)
 *   .setAlgorithms(['HS256'])
 *   .verify(secret);
 * ```
 */
export const jwtAdapter = authAdapter(() => ({
  name: 'jwt',
  methods: {
    signJwt,
    verifyJwt
  }
}));

// Export types for use in other parts of the application
export type { JwtHeader, JwtPayload, VerifyOptions };
