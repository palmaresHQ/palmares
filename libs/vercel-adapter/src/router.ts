import { serverlessRouterAdapter } from '@palmares/server';

export default serverlessRouterAdapter({
  parseHandlers: async (server, _fileSystemRootPath, path, handlers, _queryParams, handler404) => {
    let hasCreatedFile = false;
    for (const [method, handler] of handlers.entries()) {
      if (hasCreatedFile === false) {
        await handler.handler.writeFile({
          pathOfHandlerFile: (((server.settings.customServerSettings as any).rootPath as string | undefined) || '')
            .split('/').filter((path) => path !== '')
            .concat(path.split('/').filter((path) => path !== ''))
            .concat((server.settings.customServerSettings as any).fileName ?
              (server.settings.customServerSettings as any).fileName.split('/') :
              []
          ),
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
        isSpecificMethod: true,
        isSpecificRoute: true,
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
  // eslint-disable-next-line ts/require-await
  load404: async (server, handler) => {
    console.log('load404');
  },
});
