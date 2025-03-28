import { defineAuthDomain } from './domain';

import type { AuthAdapter } from './adapter';

export { authAdapter, AuthAdapter, type AdapterMethods, type AdapterConfig } from './adapter';
export {
  AuthenticationFailedException,
  InvalidSessionException,
  NotImplementedAuthAdapterException,
  RateLimitExceededException,
  AuthException,
  AuthAdapterException,
  AuthConfigurationException,
  AuthValidationException,
  AuthSecurityException
} from './exceptions';
export type { AuthConfigurationType, AuthAdapterType } from './types';
export { getAdapterConfig, type AuthConfig } from './conf';

export { getAuth } from './auth';
export { defineAuthDomain as default };

export { getAdapters } from './conf';

export interface AuthAdapters<TAdapters extends readonly (AuthAdapter | unknown)[] = unknown[]> {
  adapters: TAdapters;
}
