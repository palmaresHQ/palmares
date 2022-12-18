import { path } from '@palmares/server';
import { ExampleController } from './controllers';

import { ExpressCorsMiddleware } from './middlewares';

export default [
  path('', ExpressCorsMiddleware, path('', ExampleController.new())),
];
