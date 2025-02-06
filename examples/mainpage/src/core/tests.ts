import ExpressServerAdapter from '@palmares/express-adapter';
import { getAdapterServer, loadServerWhenTesting } from '@palmares/server';
import { beforeAll, describe } from '@palmares/tests';
import supertest from 'supertest';

beforeAll(async () => {
  console.log('beforeAll');
  await loadServerWhenTesting({ port: 4000 });
});

describe('Basic server tests', ({ test }) => {
  test('test a basic request', async ({ expect }) => {
    const server = getAdapterServer(ExpressServerAdapter);
    const response = await supertest(server)
      .get('/users')
      .expect(200, {
        users: [
          {
            id: 1,
            firstName: 'Your mom',
            email: 'sobigitdoesntfit@example.com'
          },
          {
            id: 2,
            firstName: 'Your dad',
            email: 'missing@example.com'
          }
        ]
      });
    console.log(response.body);
  });
});
