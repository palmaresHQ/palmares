export function getOriginFromHeaders(headers: {
  'x-forwarded-proto'?: string;
  'x-forwarded-ssl'?: string;
  'front-end-https'?: string;
  'x-url-scheme'?: string;
  'strict-transport-security'?: string;
  host?: string;
  'x-forwarded-host'?: string;
  'x-original-host'?: string;
}): string {
  // Check HTTPS indicators
  const httpsIndicators = {
    'x-forwarded-proto': headers['x-forwarded-proto'] === 'https',
    'x-forwarded-ssl': headers['x-forwarded-ssl'] === 'on',
    'front-end-https': headers['front-end-https'] === 'on',
    'x-url-scheme': headers['x-url-scheme'] === 'https'
  };

  const hasHSTS = 'strict-transport-security' in headers;
  const isHttps = Object.values(httpsIndicators).some(Boolean) || hasHSTS;

  // Get host from headers
  const host = headers['host'] || headers['x-forwarded-host'] || headers['x-original-host'] || '';

  // Check if host includes port
  const [hostname, port] = host.split(':');

  // Build the origin URL
  let origin = `${isHttps ? 'https' : 'http'}://${hostname}`;

  // Add port if it exists and isn't the default for the protocol
  if (port) {
    // Don't add port if it's the default for the protocol
    if ((isHttps && port !== '443') || (!isHttps && port !== '80')) {
      origin += `:${port}`;
    }
  }

  return origin;
}
