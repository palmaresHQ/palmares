import { serverlessRouterAdapter } from '@palmares/server';

export default serverlessRouterAdapter({
  parseHandlers: async (server, fileSystemRootPath, path, handlers, _queryParams, handler404) => {
    let hasCreatedFile = false;
    for (const [method, handler] of handlers.entries()) {
      if (hasCreatedFile === false) {
        await handler.handler.writeFile({
          pathOfHandlerFile: ['api'].concat(path.split('/').filter((path) => path !== '')),
          adapter: {
            name: 'VercelServerlessAdapter',
            isDefaultImport: false
          },
          projectName: '@palmares/vercel-adapter',
        })
        hasCreatedFile = true;
      }

      await handler.handler.appendBody({
        functionName: method.toUpperCase(),
        parameters: [{
          name: 'request',
          type: 'Request'
        }],
        adapter: 'VercelServerlessAdapter',
        requestAndResponseData: `{ request: request, response: Response }`,
        getMethodFunctionBody: `request.method`,
        getRouteFunctionBody: `new URL(request.url).pathname`,
      });
    }
  },
  parseRoute(_, partOfPath, urlParamType) {
    if (urlParamType) return `[${partOfPath}]`;
    else return partOfPath;
  },
  load404: async (server, handler) => {
    console.log('load404');
  },
});
