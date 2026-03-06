export function getOriginFromHeaders(headers: Headers): string {
  // Check HTTPS indicators
  const httpsIndicators = {
    'x-forwarded-proto': headers.get('x-forwarded-proto') === 'https',
    'x-forwarded-ssl': headers.get('x-forwarded-ssl') === 'on',
    'front-end-https': headers.get('front-end-https') === 'on',
    'x-url-scheme': headers.get('x-url-scheme') === 'https'
  };

  const hasHSTS = headers.has('strict-transport-security');
  const isHttps = Object.values(httpsIndicators).some(Boolean) || hasHSTS;

  // Get host from headers
  const host = headers.get('host') || headers.get('x-forwarded-host') || headers.get('x-original-host') || '';

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
