// @ts-nocheck
import ExpressServerAdapter from '@palmares/express-adapter';
import { getAdapterServer, loadServerWhenTesting } from '@palmares/server';
import { beforeAll, describe } from '@palmares/tests';
import supertest from 'supertest';

beforeAll(async () => {
  await loadServerWhenTesting({ port: 4000 });
});

describe('Basic server tests', ({ test }) => {
  test('test a basic request', async ({ expect }) => {
    const server = getAdapterServer(ExpressServerAdapter);
    const { status, body } = await supertest(server).get('/users');
    console.log(status, body);
  });
});
