# JWT Adapter for Palmares

A flexible and secure JWT implementation for the Palmares authentication system, featuring a fluent API design.

## Credits

This implementation was inspired by the excellent [jose](https://github.com/panva/jose) package, particularly its fluent API design pattern. The method chaining approach and overall API structure were influenced by their work, which provides an elegant and developer-friendly way to work with JWTs. While our implementation is independent and uses different underlying mechanisms, we owe credit to the `jose` team for setting a high standard in JWT library design.

## Features

- 🔒 Secure JWT signing and verification
- ⚡ Fluent API design for intuitive usage
- 📝 Comprehensive TypeScript support
- 🎯 Standard JWT claims support
- ⏰ Flexible expiration handling
- 🔍 Detailed verification options
- 📚 Extensive documentation

## Installation

```bash
npm install @palmares/jwt-adapter
# or
yarn add @palmares/jwt-adapter
```

## Quick Start

### Signing a Token

```typescript
import { jwtAdapter } from '@palmares/jwt-adapter';

const token = await jwtAdapter.methods.signJwt({ userId: '123' })
  .setIssuedAt()
  .setExpirationTime('1h')
  .sign(secret);
```

### Verifying a Token

```typescript
const payload = await jwtAdapter.methods.verifyJwt(token)
  .setAlgorithms(['HS256'])
  .verify(secret);
```

## API Reference

### Signing Methods

#### `signJwt(payload: JwtPayload)`
Creates a new JWT token with the given payload.

```typescript
const token = await jwtAdapter.methods.signJwt({ role: 'admin' })
  .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
  .setIssuedAt()
  .setExpirationTime('1d')
  .sign(secret);
```

Available methods:
- `setProtectedHeader(header: Partial<JwtHeader>)` - Set JWT header
- `setIssuedAt()` - Set issued at timestamp to current time
- `setExpirationTime(time: number | string)` - Set expiration time

### Verification Methods

#### `verifyJwt(token: string)`
Verifies a JWT token and returns its payload.

```typescript
const payload = await jwtAdapter.methods.verifyJwt(token)
  .setAlgorithms(['HS256'])
  .setIssuer('my-app')
  .setAudience('api')
  .setClockTolerance(30)
  .setMaxTokenAge(3600)
  .verify(secret);
```

Available methods:
- `setAlgorithms(algorithms: string[])` - Set allowed algorithms
- `setIssuer(issuer: string)` - Set expected issuer
- `setAudience(audience: string)` - Set expected audience
- `setClockTolerance(tolerance: number)` - Set time tolerance
- `setMaxTokenAge(age: number)` - Set maximum token age
- `setSubject(subject: string)` - Set expected subject
- `setTyp(typ: string)` - Set expected token type

## Types

```typescript
interface JwtPayload {
  exp?: number;      // Expiration time
  iat?: number;      // Issued at
  iss?: string;      // Issuer
  aud?: string;      // Audience
  sub?: string;      // Subject
  [key: string]: any; // Custom claims
}

interface JwtHeader {
  alg: string;       // Algorithm
  typ: string;       // Token type
}

interface VerifyOptions {
  algorithms?: string[];
  issuer?: string;
  audience?: string;
  clockTolerance?: number;
  maxTokenAge?: number;
  subject?: string;
  typ?: string;
}
```

## Security Best Practices

1. **Always use HTTPS in production**
   - JWTs are signed but not encrypted by default
   - HTTPS ensures secure transmission

2. **Keep secrets secure**
   - Store JWT secrets in environment variables
   - Rotate secrets regularly
   - Never commit secrets to version control

3. **Set appropriate expiration times**
   - Short-lived tokens for sensitive operations
   - Longer-lived tokens with refresh mechanism for user sessions

4. **Validate all claims**
   - Use the verification options to validate issuer, audience, etc.
   - Check token age to prevent token reuse

5. **Use strong algorithms**
   - HS256 or better for HMAC
   - Consider RS256/ES256 for asymmetric signing

6. **Implement proper error handling**
   - Catch and handle verification errors
   - Log security-related events

7. **Consider token blacklisting**
   - Implement a mechanism to revoke tokens
   - Store revoked tokens in a database or cache

## Development

For detailed information about the development process, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## License

MIT 