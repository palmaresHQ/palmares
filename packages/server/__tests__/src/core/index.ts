import { domain } from '@palmares/core';
import { Response, middleware, path, serverDomainModifier } from '@palmares/server';
import { testDomainModifier } from '@palmares/tests';
import cors from 'cors';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testMiddleware = middleware({
  options: {
    customOptions: [
      (req, res, next) => {
        req.params.test2 = 'test';
        next();
      }
    ]
  }
});
const route = path('/test')
  .middlewares([testMiddleware])
  .get(
    (req) => {
      console.log(req.serverData().req.params);
      return Response.json({ message: 'hello' }, { status: 200 });
    },
    {
      customOptions: [
        (req, res, next) => {
          req.params.test = 'test';
          next();
        }
      ]
    }
  );

export default domain('testingExpressServer', __dirname, {
  modifiers: [serverDomainModifier, testDomainModifier] as const,
  getRoutes: () => route,
  getTests: () => [__dirname + '/test.test.ts']
});
