import { domain } from '@palmares/core';
import { Response, path, serverDomainModifier } from '@palmares/server';
import { testDomainModifier } from '@palmares/tests';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const route = path('/test').get(() => {
  console.log('hello');
  return Response.json({ message: 'hello' }, { status: 200 });
});

export default domain('testingExpressServer', __dirname, {
  modifiers: [serverDomainModifier, testDomainModifier] as const,
  getRoutes: () => route,
  getTests: () => [__dirname + '/test.test.ts']
});
