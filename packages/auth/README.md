# @palmares/auth

## Introduction

This documentation will walk you through [palmares](https://github.com/palmaresHQ/palmares), but focusing on the [@palmares/auth](https://www.npmjs.com/package/@palmares/auth) package.

### What is palmares auth?

The [@palmares/auth](https://www.npmjs.com/package/@palmares/auth) package offers you a simple API to handle authentication in your applications. From basic username/password flows to complex OAuth2 integrations and 2FA.

At its core it does nothing, at the same time it does everything!

With 0 dependencies at its core (even no dependency on Node), you don't need to worry if it'll work on Expo, the Browser or even a Brain interface. Without an adapter this will simply not do anything. But with the adapter this package offers you the ability to authenticate users, manage sessions, and implement various security features.

You are not forced to build your project around our structure - you can use it the way you want in your existing projects without hassle.

## Features (TODO)

### Adapters
The `@palmares/auth` package follows the same adapter pattern as `@palmares/databases`, providing a flexible and extensible authentication system through adapters. This modular approach allows you to easily integrate and switch between different authentication methods based on your needs.

#### Core Authentication Adapters
- [ ] JWT Authentication (`@palmares/jwt-adapter`) - Secure, stateless authentication using JSON Web Tokens
- [ ] Session Authentication (`@palmares/session-adapter`) - Traditional session-based authentication
- [ ] Magic Link Authentication (`@palmares/magic-link-adapter`) - Passwordless email authentication

#### Multi-Factor Authentication
- [ ] TOTP Authentication (`@palmares/totp-adapter`) - Time-based One-Time Passwords (Google Authenticator, Authy, ...)
- [ ] OTP Authentication (`@palmares/otp-adapter`) - One-Time Password via SMS/Email
- [ ] Two Factor Authentication (`@palmares/two-factor-adapter`) - Comprehensive 2FA solution

#### OAuth2 & Social Authentication
- [ ] OAuth2 Core (`@palmares/oauth2-adapter`) - Base OAuth2 implementation
- [ ] Google Provider (`@palmares/google-auth-provider`) - Sign in with Google
- [ ] Github Provider (`@palmares/github-auth-provider`) - Github OAuth integration
- [ ] Discord Provider (`@palmares/discord-auth-provider`) - Discord OAuth integration
- [ ] Generic Provider (`@palmares/generic-auth-provider`) - Build custom OAuth providers

#### Third-Party Auth Service Adapters
- [ ] Auth0 (`@palmares/auth0-adapter`) - Integration with Auth0 platform
- [ ] Clerk (`@palmares/clerk-adapter`) - Integration with Clerk authentication
- [ ] AuthJS (`@palmares/authjs-adapter`) - Integration with Auth.js (NextAuth)

#### Extensibility
The adapter system is designed to be highly extensible, offering:

1. **Seamless Integration**
   - Mix multiple authentication methods
   - Use different strategies for different parts of your app
   - Combine features (e.g., JWT + 2FA)

2. **Easy Migration**
   - Switch authentication methods without changing application code
   - Gradually transition between authentication strategies
   - Test new methods alongside existing ones

3. **Custom Solutions**
   - Build custom adapters for specific needs
   - Extend existing adapters with additional functionality
   - Integrate with proprietary authentication systems

### Core Authentication
- [ ] Multiple authentication backend support
  - [ ] Session-based authentication
  - [ ] JWT authentication
  - [ ] Token authentication
- [ ] User and authentication model abstractions
- [ ] Secure login/logout flows
- [ ] Password management
  - [ ] Password hashing adapter interface
  - [ ] Password validation and policies
  - [ ] Password reset flow
  - [ ] Password strength requirements

### Enhanced Security
- [ ] Two-factor authentication (2FA) adapter interface
  - [ ] TOTP adapter interface
  - [ ] SMS/Email verification adapter interface
  - [ ] Backup codes generation and management
- [ ] Session management and security
  - [ ] Session timeout
  - [ ] Concurrent session handling
  - [ ] Session invalidation
  - [ ] IP-based session tracking
  - [ ] Suspicious activity detection
- [ ] Email verification adapter interface
- [ ] Rate limiting and brute force protection
  - [ ] Configurable attempt limits
  - [ ] Progressive delays
  - [ ] IP-based blocking
- [ ] Security event logging
  - [ ] Login attempts
  - [ ] Password changes
  - [ ] Security setting modifications
- [ ] Account recovery options
  - [ ] Security questions
  - [ ] Recovery codes

### OAuth & Social Authentication
- [ ] OAuth2 adapter interface
- [ ] Social authentication adapter interfaces
  - [ ] Google adapter interface
  - [ ] Apple adapter interface
  - [ ] GitHub adapter interface
  - [ ] Facebook adapter interface
  - [ ] Twitter adapter interface
  - [ ] LinkedIn adapter interface
  - [ ] Microsoft adapter interface
  - [ ] Custom providers support
- [ ] OpenID Connect support
  - [ ] Standard claims
  - [ ] ID token validation
  - [ ] UserInfo endpoint

### Development & Documentation
- [ ] Comprehensive test suite (80%+ coverage)
- [ ] Complete API documentation
- [ ] Usage examples and guides
- [ ] Type-safe authentication flows
- [ ] Security best practices documentation

Note: Authorization features (RBAC, ABAC, group-based permissions) will be implemented in the separate @palmares/permissions package to maintain a clear separation of concerns between authentication and authorization.