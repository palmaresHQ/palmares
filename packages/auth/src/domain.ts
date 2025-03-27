import { domain } from '@palmares/core';

import { setAdapters } from './conf';

import type { AuthAdapter } from './adapter';

/**
 * Configuration interface for defining an auth domain
 */
interface DefineAuthDomainConfig {
  /**
   * Array of auth adapter factory functions returned from AuthAdapter.new()
   */
  adapters: ReturnType<typeof AuthAdapter.new>[];
}

/**
 * Defines and configures the auth domain with the provided adapters.
 * This is the main entry point for setting up authentication in a Palmares application.
 *
 * @param config - Configuration object containing auth adapters
 * @returns Domain configuration for @palmares/auth
 *
 * @example
 * ```ts
 * defineAuthDomain({
 *   adapters: [
 *     JWTAuthAdapter.new({ secret: 'my-secret' }),
 *     SessionAuthAdapter.new()
 *   ]
 * });
 * ```
 */
export function defineAuthDomain(config: DefineAuthDomainConfig) {
  setAdapters(config.adapters);

  return domain('@palmares/auth', '', {});
}
