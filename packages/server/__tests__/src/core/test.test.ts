import { ExpressServerAdapter } from '@palmares/express-adapter';
import { getAdapterServer, loadServerWhenTesting } from '@palmares/server';
import { beforeAll, describe } from '@palmares/tests';
import supertest from 'supertest';

import type JestTestAdapter from '@palmares/jest-tests';

beforeAll(async () => {
  await loadServerWhenTesting({ port: 4000 });
});

describe<JestTestAdapter>('Basic server tests', ({ test }) => {
  test('test a basic request', async ({ expect }) => {
    const server = getAdapterServer(ExpressServerAdapter);
    const response = await supertest(server).get('/test');

    expect(response.body).toStrictEqual({ message: 'hello' });
    // fetch('http://localhost:4000');
  });
});
