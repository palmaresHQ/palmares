import { path, pathNested } from '@palmares/server';
import { routerController, allController } from './controllers';
import { middleware1 } from './middlewares';

export const baseRouter = path('/router');
export const allRouter = pathNested<typeof baseRouter>()('/all');

export default path('').nested([
  baseRouter.nested([routerController, allRouter.nested([allController]).middlewares([middleware1] as const)]),
]);
