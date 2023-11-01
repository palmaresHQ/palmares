import { path, pathNested } from '@palmares/server';

import { typingTestHeaderMiddleware, typingTestAuthenticateUserMiddleware, middlewareOrdering1 } from './middlewares';
import { typingTestController, middlewareOrderingController } from './controllers';

export const baseRouter = path('/base').middlewares([typingTestHeaderMiddleware]);

export const rootRouter = pathNested<typeof baseRouter>()('/management/<filter: string>').middlewares([
  typingTestAuthenticateUserMiddleware,
]);

export const middlewareOrderingRouter = path('/middleware-ordering').middlewares([middlewareOrdering1]);

export default path('').nested([
  baseRouter.nested([rootRouter.nested([typingTestController])]),
  middlewareOrderingRouter.nested([middlewareOrderingController]),
]);
