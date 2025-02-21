import { domain } from '@palmares/core';

/**
 * Result of an authentication attempt.
 * Contains success status, optional credentials (like JWT token or session ID),
 * additional data (like user info), and error message if failed.
 *
 * @template TCredentials - Authentication credentials type (e.g. JWT token)
 * @template TData - Additional data type (e.g. user profile)
 */
type AuthenticationResult<TCredentials = unknown, TData = unknown> = {
  /** Authentication success status */
  success: boolean;
  /** Authentication credentials if successful */
  credentials?: TCredentials;
  /** Additional authentication data */
  data?: TData;
  /** Error message if failed */
  error?: string;
};

/**
 * The result of verifying authentication credentials.
 *
 * @template TData - Optional data returned with the verification
 */
type VerificationResult<TData = unknown> = {
  /** Whether the verification was successful */
  success: boolean;
  /** Additional data returned with the verification (user info, etc) */
  data?: TData;
  /** Optional error message if verification failed */
  error?: string;
};

/**
 * The auth domain modifier provides the core authentication interface.
 * This allows adapters to implement different authentication strategies
 * while maintaining a consistent API.
 */
const authDomainModifier = domain<{
  /**
   * Authenticates a user with the provided credentials.
   *
   * @template TCredentials - The type of credentials required for authentication
   * @param credentials - The credentials to authenticate with
   * @returns Authentication result with optional credentials and data
   */
  authenticate: <TCredentials>(credentials: TCredentials) => Promise<AuthenticationResult>;

  /**
   * Verifies authentication credentials.
   *
   * @template TAuthProof - The type of authentication proof to verify
   * @param authProof - The authentication proof to verify
   * @returns Verification result with optional data
   */
  verify: <TAuthProof>(authProof: TAuthProof) => Promise<VerificationResult>;

  /**
   * Invalidates authentication credentials.
   *
   * @template TAuthProof - The type of authentication proof to invalidate
   * @param authProof - The authentication proof to invalidate
   */
  invalidate: <TAuthProof>(authProof: TAuthProof) => Promise<void>;

  /**
   * Logs out a user by invalidating their authentication credentials.
   *
   * @template TAuthProof - The type of authentication proof to invalidate
   * @param authProof - The authentication proof to invalidate
   */
  logout: <TAuthProof>(authProof: TAuthProof) => Promise<void>;
}>('@palmares/auth', '', {});

export { authDomainModifier };

/**
 * The auth domain provides a flexible authentication system that can be adapted
 * to different authentication methods through adapters.
 *
 * Features:
 * - Support for multiple authentication strategies (token, session, etc)
 * - Pluggable adapter system for different auth implementations
 * - Type-safe authentication flows
 * - Support for additional auth data and error handling
 */
export const authDomain = domain('@palmares/auth', '', {
  modifiers: [authDomainModifier],
  // eslint-disable-next-line ts/require-await
  load: async () => {
    return async () => {};
  },
  ready: async () => {},
  close: async () => {},
  // eslint-disable-next-line ts/require-await
  authenticate: async <TCredentials>(credentials: TCredentials) => {
    return {
      success: true,
      credentials: 'example-token',
      data: { userId: '123' }
    };
  },
  // eslint-disable-next-line ts/require-await
  verify: async <TAuthProof>(authProof: TAuthProof) => {
    return {
      success: true,
      data: { userId: '123' }
    };
  },
  // eslint-disable-next-line ts/require-await
  invalidate: async <TAuthProof>(authProof: TAuthProof) => {
    return;
  },
  // eslint-disable-next-line ts/require-await
  logout: async <TAuthProof>(authProof: TAuthProof) => {
    return;
  }
});
