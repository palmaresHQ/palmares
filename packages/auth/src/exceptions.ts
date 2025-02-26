/**
 * Base class for all auth-related exceptions
 */
export class AuthException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthException';
  }
}

/**
 * Base class for adapter-specific exceptions
 */
export class AuthAdapterException extends AuthException {
  constructor(adapterName: string, message: string) {
    super(`[${adapterName}] ${message}`);
    this.name = 'AuthAdapterException';
  }
}

/**
 * Base class for configuration-related exceptions
 */
export class AuthConfigurationException extends AuthException {
  constructor(message: string) {
    super(message);
    this.name = 'AuthConfigurationException';
  }
}

/**
 * Base class for validation-related exceptions
 */
export class AuthValidationException extends AuthException {
  constructor(message: string) {
    super(message);
    this.name = 'AuthValidationException';
  }
}

/**
 * Base class for security-related exceptions
 */
export class AuthSecurityException extends AuthException {
  constructor(message: string) {
    super(message);
    this.name = 'AuthSecurityException';
  }
}

/**
 * Thrown when an adapter method is not implemented
 */
export class NotImplementedAuthAdapterException extends AuthAdapterException {
  constructor(adapterName: string, methodName: string) {
    super(adapterName, `The auth adapter method '${methodName}' is not implemented.`);
    this.name = 'NotImplementedAuthAdapterException';
  }
}

/**
 * Thrown when authentication fails
 */
export class AuthenticationFailedException extends AuthException {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationFailedException';
  }
}

/**
 * Thrown when session validation fails
 */
export class InvalidSessionException extends AuthException {
  constructor(message = 'Invalid or expired session') {
    super(message);
    this.name = 'InvalidSessionException';
  }
}

/**
 * Thrown when rate limit is exceeded
 */
export class RateLimitExceededException extends AuthException {
  constructor(message = 'Too many authentication attempts') {
    super(message);
    this.name = 'RateLimitExceededException';
  }
}
