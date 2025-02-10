import type { getHeaders } from 'vinxi/http';

export function isChromium(headers?: ReturnType<typeof getHeaders>) {
  const isChromiumFromServer = headers?.['user-agent']?.includes('Chrome');
  if (isChromiumFromServer) return true;
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.indexOf('Chrome') !== -1;
}
