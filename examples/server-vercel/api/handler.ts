import { Serverless } from '@palmares/server';
import { VercelServerlessAdapter } from '@palmares/vercel-adapter';
import settings from '../src/settings.ts';

async function GET(request: Request) {
  return Serverless.handleServerless(settings, {
    requestAndResponseData: { request: request, response: Response },
    domainRoutes: ['test'],
    getRoute: () => new URL(request.url).pathname,
    serverName: 'default',
    adapter: VercelServerlessAdapter,
    getMethod: () => request.method
  });
}
export { GET };
