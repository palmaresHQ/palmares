import { defineAuthDomain } from './domain';

import type { AuthAdapter } from './adapter';

export { authAdapter, AuthAdapter, type AdapterMethods } from './adapter';
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

export { Auth, getAuth } from './auth';
export { defineAuthDomain as default };

export interface AuthAdapters<TAdapters extends readonly (AuthAdapter | unknown)[] = unknown[]> {
  adapters: TAdapters;
}

export { getAdapters } from './conf';
