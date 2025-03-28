import { domain } from '@palmares/core';

import { initConfig, setAdapters } from './conf';

import type { AuthAdapter } from './adapter';

/**
 * Configuration interface for defining an auth domain
 */
interface DefineAuthDomainConfig {
  /**
   * Array of auth adapter instances
   */
  adapters: AuthAdapter[];
}

/**
 * Defines and configures the auth domain with the provided adapters.
 * This is the main entry point for setting up authentication in a Palmares application.
 *
 * @example
 * ```ts
 * defineAuthDomain({
 *   adapters: [
 *     JWTAuthAdapter.new({ secret: 'my-secret' }),
 *     PasswordAdapter.new({
 *       minLength: 8,
 *       requireSpecialChars: true
 *     })
 *   ]
 * });
 * ```
 */
export function defineAuthDomain(config: DefineAuthDomainConfig) {
  // Initialize the config system
  initConfig();

  // Set the adapters
  setAdapters(config.adapters);

  return domain('@palmares/auth', '', {});
}
