import { createHmac } from 'crypto';

import type { JwtHeader, JwtPayload, SignJWTState, VerifyJWTState, VerifyOptions } from '../types/jwt';

/**
 * Decodes a base64url string to a regular string
 * @param str - The base64url string to decode
 * @returns The decoded string
 */
function base64UrlDecode(str: string): string {
  const buffer = Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

  return buffer.toString('utf-8');
}

/**
 * Encodes a string to base64url format
 * @param str - The string to encode
 * @returns The base64url encoded string
 */
function base64UrlEncode(str: string): string {
  const buffer = Buffer.from(str);

  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Creates an HMAC signature for the given payload
 * @param payload - The payload to sign
 * @param secret - The secret key to use for signing
 * @returns The base64url encoded signature
 */
function createSignature(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret);

  hmac.update(payload);

  const digest = hmac.digest();

  return base64UrlEncode(digest.toString('hex'));
}

/**
 * Gets the JWT secret from environment variables
 * @throws {Error} If JWT_SECRET is not set
 * @returns The JWT secret
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');

  return secret;
}

/**
 * Creates a new JWT token with a fluent API
 * @param payload - The payload to include in the token
 * @returns An object with methods to configure and sign the token
 * @example
 * ```typescript
 * const token = await signJwt({ userId: '123' })
 *   .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
 *   .setIssuedAt()
 *   .setExpirationTime('1h')
 *   .sign(secret);
 * ```
 */
export function signJwt(payload: JwtPayload) {
  const state: SignJWTState = {
    payload,
    header: {
      alg: 'HS256',
      typ: 'JWT'
    }
  };

  return {
    /**
     * Sets the protected header of the JWT
     * @param header - The header properties to set
     * @returns The signer object for chaining
     */
    setProtectedHeader(header: Partial<JwtHeader>) {
      state.header = { ...state.header, ...header };
      return this;
    },

    /**
     * Sets the issued at time to the current time
     * @returns The signer object for chaining
     */
    setIssuedAt() {
      state.issuedAt = Math.floor(Date.now() / 1000);
      return this;
    },

    /**
     * Sets the expiration time of the token
     * @param time - Either a Unix timestamp or a string like '1h', '1d', '1w', '1m', '1y'
     * @returns The signer object for chaining
     * @throws {Error} If the time string format is invalid
     */
    setExpirationTime(time: number | string) {
      if (typeof time === 'string') {
        const unit = time.slice(-1);
        const value = parseInt(time.slice(0, -1));
        const now = Math.floor(Date.now() / 1000);

        switch (unit) {
          case 'h':
            state.expirationTime = now + value * 3600;
            break;
          case 'd':
            state.expirationTime = now + value * 86400;
            break;
          case 'w':
            state.expirationTime = now + value * 604800;
            break;
          case 'm':
            state.expirationTime = now + value * 2592000;
            break;
          case 'y':
            state.expirationTime = now + value * 31536000;
            break;
          default:
            throw new Error('Invalid time unit. Use h, d, w, m, or y');
        }
      } else state.expirationTime = time;

      return this;
    },

    /**
     * Signs the JWT with the given secret
     * @param secret - The secret key to use for signing
     * @returns The signed JWT token
     */
    // eslint-disable-next-line ts/require-await
    async sign(secret: string): Promise<string> {
      // Add issuedAt and expirationTime to payload if set
      if (state.issuedAt) state.payload.iat = state.issuedAt;

      if (state.expirationTime) state.payload.exp = state.expirationTime;

      // Encode header and payload
      const headerB64 = base64UrlEncode(JSON.stringify(state.header));
      const payloadB64 = base64UrlEncode(JSON.stringify(state.payload));

      // Create signature
      const headerPayload = `${headerB64}.${payloadB64}`;
      const signature = createSignature(headerPayload, secret);

      // Combine all parts
      return `${headerB64}.${payloadB64}.${signature}`;
    }
  };
}

/**
 * Verifies a JWT token with a fluent API
 * @param token - The JWT token to verify
 * @returns An object with methods to configure and perform verification
 * @example
 * ```typescript
 * const payload = await verifyJwt(token)
 *   .setAlgorithms(['HS256'])
 *   .setTyp('JWT')
 *   .verify(secret);
 * ```
 */
export function verifyJwt(token: string) {
  const state: VerifyJWTState = {
    token,
    options: {
      algorithms: ['HS256'],
      clockTolerance: 0,
      typ: 'JWT'
    }
  };

  return {
    /**
     * Sets the allowed signing algorithms
     * @param algorithms - Array of allowed algorithm names
     * @returns The verifier object for chaining
     */
    setAlgorithms(algorithms: string[]) {
      state.options.algorithms = algorithms;
      return this;
    },

    /**
     * Sets the expected token issuer
     * @param issuer - The expected issuer
     * @returns The verifier object for chaining
     */
    setIssuer(issuer: string) {
      state.options.issuer = issuer;
      return this;
    },

    /**
     * Sets the expected token audience
     * @param audience - The expected audience
     * @returns The verifier object for chaining
     */
    setAudience(audience: string) {
      state.options.audience = audience;
      return this;
    },

    /**
     * Sets the clock tolerance for expiration checks
     * @param tolerance - Time tolerance in seconds
     * @returns The verifier object for chaining
     */
    setClockTolerance(tolerance: number) {
      state.options.clockTolerance = tolerance;
      return this;
    },

    /**
     * Sets the maximum allowed age of the token
     * @param age - Maximum age in seconds
     * @returns The verifier object for chaining
     */
    setMaxTokenAge(age: number) {
      state.options.maxTokenAge = age;
      return this;
    },

    /**
     * Sets the expected token subject
     * @param subject - The expected subject
     * @returns The verifier object for chaining
     */
    setSubject(subject: string) {
      state.options.subject = subject;
      return this;
    },

    /**
     * Sets the expected token type
     * @param typ - The expected type
     * @returns The verifier object for chaining
     */
    setTyp(typ: string) {
      state.options.typ = typ;
      return this;
    },

    /**
     * Verifies the JWT token with the given secret
     * @param secret - The secret key to use for verification
     * @returns The decoded payload if verification succeeds
     * @throws {Error} If verification fails
     */
    // eslint-disable-next-line ts/require-await
    async verify(secret: string): Promise<JwtPayload> {
      try {
        // Split the token into header, payload, and signature
        const [headerB64, payloadB64, signature] = state.token.split('.');

        if (!headerB64 || !payloadB64 || !signature) {
          throw new Error('Invalid JWT format');
        }

        // Decode and parse header and payload
        const headerStr = base64UrlDecode(headerB64);
        const payloadStr = base64UrlDecode(payloadB64);
        const header: JwtHeader = JSON.parse(headerStr);
        const payload: JwtPayload = JSON.parse(payloadStr);

        // Verify algorithm
        if (!state.options.algorithms?.includes(header.alg)) throw new Error(`Algorithm ${header.alg} not allowed`);

        // Verify type
        if (state.options.typ && header.typ !== state.options.typ) throw new Error(`Type ${header.typ} not allowed`);

        // Verify issuer
        if (state.options.issuer && payload.iss !== state.options.issuer) throw new Error('Invalid issuer');

        // Verify audience
        if (state.options.audience && payload.aud !== state.options.audience) throw new Error('Invalid audience');

        // Verify subject
        if (state.options.subject && payload.sub !== state.options.subject) throw new Error('Invalid subject');

        // Verify expiration
        if (payload.exp) {
          const now = Math.floor(Date.now() / 1000);
          const tolerance = state.options.clockTolerance || 0;

          if (payload.exp < now - tolerance) throw new Error('Token has expired');
        }

        // Verify token age
        if (state.options.maxTokenAge && payload.iat) {
          const now = Math.floor(Date.now() / 1000);
          const age = now - payload.iat;

          if (age > state.options.maxTokenAge) {
            throw new Error('Token too old');
          }
        }

        // Verify signature
        const headerPayload = `${headerB64}.${payloadB64}`;
        const expectedSignature = createSignature(headerPayload, secret);

        if (signature !== expectedSignature) throw new Error('Invalid signature');

        return payload;
      } catch (error: unknown) {
        if (error instanceof Error) throw new Error(`JWT verification failed: ${error.message}`);

        throw new Error('JWT verification failed: Unknown error');
      }
    }
  };
}
