import { Serverless } from '@palmares/server';
import { VercelServerlessAdapter } from '@palmares/vercel-adapter';
import settings from '../../../../../src/settings';

async function GET(request: Request) {
  return Serverless.handleServerless(settings, {
    requestAndResponseData: { request: request, response: Response },
    getRoute: () => new URL(request.url).pathname,
    serverName: 'default',
    adapter: VercelServerlessAdapter,
    getMethod: () => request.method,
    method: 'get',
    route: '/test/api/<id: string>/customers/<customerId: number>',
    domainRoutes: ['test']
  });
}
export { GET };
