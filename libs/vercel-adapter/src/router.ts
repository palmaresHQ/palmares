import { serverlessRouterAdapter } from '@palmares/server';
import fs from 'fs';
import  nodePath from 'node:path';
/**
 * This will automatically initialize all the routes of the server on the express server.
 */
export default serverlessRouterAdapter({
  /**
   * Handler is the function to call when a request is made to the server, by default Palmares
   * gives us the option to send a data during the request/response lifecycle, we just send req and res.
   *
   * We can use this data to send a response, parse the request and do pretty much anything.
   */
  parseHandlers: (server, fileSystemRootPath, path, handlers, _queryParams, handler404) => {
    for (const [method, handler] of handlers.entries()) {
      fs.writeFileSync(nodePath.join(fileSystemRootPath, 'api', 'handler.ts'), `${handler.handler.getImports({
        pathOfHandlerFile: ['api', 'handler'],
        adapter: {
          name: 'VercelServerlessAdapter',
          isDefault: false
        },
        projectName: '@palmares/vercel-adapter',
      })}\n\n` +
      `${handler.handler.getBody({
        functionName: method.toUpperCase(),
        parameters: [{
          name: 'request',
          type: 'Request'
        }],
        adapter: 'VercelServerlessAdapter',
        ident: 2,
        requestAndResponseData: `{ request: request, response: Response }`,
        getMethodFunctionBody: `request.method`,
        getRouteFunctionBody: `new URL(request.url).pathname`,
      })}\n`);
    }
  },
  parseRoute(_, partOfPath, urlParamType) {
    if (urlParamType) return `:${partOfPath}`;
    else return partOfPath;
  },
  load404: async (server, handler) => {
    console.log('load404');
  },
});
