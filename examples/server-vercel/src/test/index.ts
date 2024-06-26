import { domain } from '@palmares/core';
import { Response, path, serverDomainModifier } from '@palmares/server';


export default domain('test', __dirname, {
  modifiers: [serverDomainModifier] as const,
  getRoutes: () =>
    path('/test')
      .get(async () => {
        return Response.json({ message: 'Hello Serverless!' });
      })
      .nested((path) => [
        path('/<id: number>')
          .get(async ({ params }) => {
            console.log(params.id);
            return Response.json({ id: params.id });
          })
      ])
});
