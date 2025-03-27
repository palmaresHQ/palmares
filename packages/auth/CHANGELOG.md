# @palmares/auth

All notable changes to this package will be documented in this file.
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Core authentication domain with zero dependencies
- Flexible adapter system for implementing different auth strategies
- Type-safe authentication flows with comprehensive TypeScript support
- Base `AuthAdapter` class with factory pattern for creating custom adapters
- Core authentication interface with:
  - Generic type system for credentials, results, and identifiers
  - Optional instance and configuration types
  - Minimal required methods (`authenticate`, `getIdentifier`)
- Optional event system with standard auth events:
  - `auth:attempt`, `auth:success`, `auth:failure`
  - `auth:logout`, `auth:refresh`, `auth:revoke`
  - `auth:validate`, `auth:error`
- Optional hook system with:
  - Pre/post operation hooks
  - Priority-based execution
  - Typed context data
  - Async support
- Authentication domain with core methods:
  - `authenticate` - Handle user authentication
  - `verify` - Verify authentication credentials
  - `invalidate` - Invalidate authentication credentials
- Error handling system with:
  - Base `AuthException` class
  - `AuthAdapterException` for adapter-specific errors
  - `NotImplementedAuthAdapterException` for unimplemented methods
