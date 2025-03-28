/**
 * Represents the payload of a JWT token
 * @interface JwtPayload
 * @property {number} [exp] - Unix timestamp when the token expires
 * @property {number} [iat] - Unix timestamp when the token was issued
 * @property {string} [iss] - Token issuer
 * @property {string} [aud] - Token audience
 * @property {string} [sub] - Token subject
 * @property {any} [key: string] - Any additional custom claims
 */
export interface JwtPayload {
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
  sub?: string;
  [key: string]: any;
}

/**
 * Represents the header of a JWT token
 * @interface JwtHeader
 * @property {string} alg - The signing algorithm used (e.g., 'HS256')
 * @property {string} typ - The type of token (usually 'JWT')
 */
export interface JwtHeader {
  alg:
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
  typ: 'JWT';
}

/**
 * Options for JWT verification
 * @interface VerifyOptions
 * @property {string[]} [algorithms] - List of allowed signing algorithms
 * @property {string} [issuer] - Expected token issuer
 * @property {string} [audience] - Expected token audience
 * @property {number} [clockTolerance] - Time tolerance in seconds for expiration checks
 * @property {number} [maxTokenAge] - Maximum allowed age of the token in seconds
 * @property {string} [subject] - Expected token subject
 * @property {string} [typ] - Expected token type
 */
export interface VerifyOptions {
  algorithm?: string;
  issuer?: string;
  audience?: string;
  clockTolerance?: number;
  maxTokenAge?: number;
  subject?: string;
  typ?: string;
}

/**
 * Internal state for JWT signing operations
 */
export interface SignJWTState {
  payload: JwtPayload;
  header: JwtHeader;
  issuedAt?: number;
  expiresIn?: number;
}

/**
 * Internal state for JWT verification operations
 */
export interface VerifyJWTState {
  token: string;
  options: VerifyOptions;
}
