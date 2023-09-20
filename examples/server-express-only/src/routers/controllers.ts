import { Response, pathNested, middleware } from '@palmares/server';
import { allRouter, baseRouter } from './routes';
import { middleware2 } from './middlewares';

export const routerController = pathNested<typeof baseRouter>()('')
  .get(() => {
    return Response.json({ message: 'Get Ok' });
  })
  .delete(() => {
    return Response.json({ message: 'Delete Ok' });
  })
  .head(() => {
    console.log('Head Ok');
    return Response.json({ message: 'Head Ok' });
  })
  .post(() => {
    return Response.json({ message: 'Post Ok' });
  })
  .patch(() => {
    return Response.json({ message: 'Patch Ok' });
  })
  .put(() => {
    return Response.json({ message: 'Put Ok' });
  })
  .options(() => {
    console.log('Options Ok');
    return Response.json({ message: 'Options Ok' });
  });

export const allController = pathNested<typeof allRouter>()('')
  .all(() => {
    console.log('received request');
    return Response.json({ message: 'All Ok' });
  })
  .middlewares([middleware2] as const);
