import { handleServerless } from "@palmares/server";
import { VercelServerlessAdapter } from "@palmares/vercel-adapter";
import settings from '../settings';

export default async function GET(request: Request) {
  return handleServerless(settings, {
    requestAndResponseData: {
      request: request,
      response: Response
    },
    domainRoutes: ['test'],
    getRoute: () => new URL(request.url).pathname,
    serverName: 'default',
    adapter: VercelServerlessAdapter,
    getMethod: () => request.method
  })
}

const request = new Request(new URL('/test/123', 'https://localhost:3000'), {
  method: 'GET'
})
GET(request).then((response) => {
  return response.json()

}).then((data) => {
  console.log(data)
}).catch(console.error)
