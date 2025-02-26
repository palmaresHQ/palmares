import { defineAuthDomain } from './domain';

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

export { Auth } from './auth';
export { defineAuthDomain as default };

export { getAdapters } from './conf';
