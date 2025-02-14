import { serverlessAdapter } from '@palmares/server';

import VercelRequestAdapter from './request';
import VercelResponseAdapter from './response';
import VercelRouterAdapter from './router';

export default serverlessAdapter({
  name: 'vercel',
  request: new VercelRequestAdapter(),
  response: new VercelResponseAdapter(),
  routers: new VercelRouterAdapter(),
  customServerSettings: (args: { rootPath?: string; fileName?: string }) => {
    return args;
  },
  load: async (_serverName: string, _domains: any[], _settings: any) => {},
  // eslint-disable-next-line ts/require-await
  generate: async (...args: any[]) => {
    console.log('generate', args);
  }
});
