# @palmares/auth Package Design

## Core Philosophy
The `@palmares/auth` package is designed with three fundamental principles:
1. **Zero Core Dependencies**: The core package has no dependencies, making it platform-agnostic
2. **Everything is an Adapter**: All actual implementations are handled by adapters
3. **Type-Safe by Design**: Comprehensive TypeScript types for end-to-end type safety

## Package Structure

### 1. Core Authentication Interface
```typescript
interface AuthAdapterType<
  TCredentials extends Record<string, unknown>,
  TAuthResult extends Record<string, unknown>,
  TInstance extends Record<string, unknown> = Record<string, unknown>,
  TConfig extends Record<string, unknown> = Record<string, unknown>
> {
  readonly $$type: '$PAuthAdapter';
  readonly authSettings: AuthConfigurationType<TConfig>;
  readonly instance?: TInstance;
  readonly __argumentsUsed: unknown;
}
```

The adapter system provides:
- Fully generic type system for credentials, results, and instances
- Optional instance and configuration types
- Minimal required interface to keep the core simple
- Factory pattern for adapter creation

### 2. Adapter Methods
The adapter mechanism now uses a method-based approach with strongly typed methods:

```typescript
export type AdapterMethods = {
  [key: string]: (params: any) => Promise<any> | any;
};

export class AuthAdapter<
  TName extends string,
  TMethods extends AdapterMethods,
  TInstance extends Record<string, unknown> = Record<string, unknown>,
  TConfig extends Record<string, unknown> = Record<string, unknown>
> implements AuthAdapterType<TInstance, TConfig>, Partial<AuthEventEmitterType>, Partial<AuthHookManagerType> {
  readonly name!: TName;
  readonly $$type = '$PAuthAdapter';
  readonly authSettings!: AuthConfigurationType<TConfig>;
  readonly instance?: TInstance;
  readonly __argumentsUsed!: unknown;
  readonly methods!: TMethods;
  
  // ...
}
```

This provides:
- Named adapters via the `TName` generic
- Custom methods via the `TMethods` generic
- Type-safe access to adapter methods

### 3. Event System
The event system is optional and can be implemented by adapters:

```typescript
interface AuthEventEmitterType {
  emit: <TPayload extends AuthEventPayloadType>(
    event: AuthEventType,
    payload: TPayload
  ) => Promise<void> | void;

  on: <TPayload extends AuthEventPayloadType>(
    event: AuthEventType,
    listener: AuthEventListener<TPayload>
  ) => void;

  off: <TPayload extends AuthEventPayloadType>(
    event: AuthEventType,
    listener: AuthEventListener<TPayload>
  ) => void;
}

type AuthEventType = 
  | 'auth:attempt' 
  | 'auth:success' 
  | 'auth:failure'
  | 'auth:logout'
  | 'auth:refresh'
  | 'auth:revoke'
  | 'auth:validate'
  | 'auth:error';
```

### 4. Hook System
The hook system is optional and can be implemented by adapters:

```typescript
interface AuthHookManagerType {
  registerHook: <TContext extends AuthHookContextType, TResult>(
    handler: AuthHookHandler<TContext, TResult>,
    options: AuthHookOptions
  ) => void;

  unregisterHook: <TContext extends AuthHookContextType, TResult>(
    handler: AuthHookHandler<TContext, TResult>
  ) => void;
}
```

Features:
- Pre/post operation hooks
- Priority-based execution
- Typed context data
- Async support

### 5. Auth Proxy
The package now provides a proxy-based API for accessing adapters and their methods:

```typescript
type Adapter<TName extends string, TMethods extends AdapterMethods> = {
  name: TName;
  methods: TMethods;
};

type AuthProxy<TAdapters extends readonly Adapter<string, AdapterMethods>[]> = {
  [KAdapter in TAdapters[number] as KAdapter['name']]: KAdapter['methods'];
};

export const Auth = createAuthProxy(getAdapters());
```

This provides:
- Type-safe access to adapters by name
- Direct method calls on adapters
- Runtime validation of adapter availability

### 6. Adapter Factory
The package provides a factory function for creating new adapters:
```typescript
function authAdapter<TName extends string, TMethods extends AdapterMethods>(args: {
  new: (...args: any[]) => [any, () => AuthAdapter<TName, TMethods>];
}): typeof AuthAdapter & {
  new (): AuthAdapter<TName, TMethods, any>;
}
```

## Adapter Implementation Guidelines

### What Goes in Adapters
1. **Authentication Logic**:
   - Specific auth mechanisms (JWT, Session, OAuth, etc.)
   - Storage implementations
   - Token/Session management

2. **Adapter-Specific Methods**:
   - Custom authentication methods
   - Validation methods
   - Token management methods
   - User management methods

3. **Optional Features**:
   - Event emission
   - Hook system
   - Custom validation
   - Custom security measures

### What Stays in Core
1. **Base Interfaces**:
   - Auth adapter interface
   - Event emitter interface
   - Hook manager interface

2. **Common Types**:
   - Flow states
   - Credential base types
   - Context types

3. **Error Classes**:
   - Base error hierarchy
   - Common error types

## Creating New Adapters

### Steps
1. Use the `authAdapter` factory function
2. Define your adapter name and methods
3. Implement the `new` factory method
4. Optionally implement:
   - Event system
   - Hook system
5. Add adapter-specific methods
6. Add adapter-specific error handling

### Best Practices
1. Keep adapters focused on one auth method
2. Use generics for type safety
3. Implement optional features as needed
4. Extend core errors for specific cases
5. Document adapter-specific methods

## Example Adapter Implementation
```typescript
interface JWTMethods {
  authenticate: (credentials: { username: string; password: string }) => Promise<{ token: string; user: User }>;
  verify: (token: string) => Promise<User | null>;
  refresh: (token: string) => Promise<{ token: string }>;
}

const JWTAuthAdapter = authAdapter<'jwt', JWTMethods>({
  new: (config) => {
    // Implementation
    const instance = { /* ... */ };
    
    const methods: JWTMethods = {
      authenticate: async (credentials) => { /* ... */ },
      verify: async (token) => { /* ... */ },
      refresh: async (token) => { /* ... */ },
    };
    
    return [instance, () => {
      const adapter = new JWTAuthAdapter();
      adapter.name = 'jwt';
      adapter.methods = methods;
      adapter.authSettings = { adapterConfig: config };
      return adapter;
    }];
  }
});
```

## Usage Example
```typescript
// Access an adapter by name
const { token, user } = await Auth.jwt.authenticate({ 
  username: 'test@example.com', 
  password: 'secret123' 
});

// Verify a token
const user = await Auth.jwt.verify(token);
```

## Security Considerations

1. **Core Package**:
   - No security implementations
   - Only interfaces and types
   - Error handling structure

2. **Adapters**:
   - Implement security measures
   - Handle sensitive data
   - Manage auth lifecycle
   - Implement proper validation

## Next Steps

1. **Core Package**:
   - [ ] Complete type documentation
   - [ ] Add adapter testing utilities
   - [ ] Add adapter validation utilities

2. **Adapters to Create**:
   - [ ] Session adapter
   - [ ] JWT adapter
   - [ ] OAuth2 adapter
   - [ ] 2FA adapter

3. **Documentation**:
   - [ ] API documentation
   - [ ] Adapter creation guide
   - [ ] Security best practices
   - [ ] Migration guides

## Remember
- Core package provides structure only
- All implementations go in adapters
- Keep types generic and reusable
- Focus on type safety
- Think about extensibility
- Events and hooks are optional
- Adapters should be focused and single-purpose 