import { domain } from '@palmares/core';
import { Response, path, serverDomainModifier } from '@palmares/server';

export default domain('test', __dirname, {
  modifiers: [serverDomainModifier] as const,
  getRoutes: () =>
    path('/test/api')
      .get(async () => {
        return Response.json({ message: 'Hello Serverless!' });
      })
      .patch(async ({ body }) => {
        return Response.json({ message: 'Hello Serverless!', body });
      })
      .nested((path) => [
        path('/<id: number>')
          .get(async ({ params }) => {
            console.log(params.id);
            return Response.json({ id: params.id });
          })
          .post(async ({ params, body }) => {
            console.log(params.id, body);
            return Response.json({ id: params.id, body });
          }),
        path('/<id: string>/customers/<customerId: number>').get(async ({ params }) => {
          console.log(params.id, params.customerId);
          return Response.json({ id: params.id, customerId: params.customerId });
        })
      ])
});
