import { path, pathNested } from '@palmares/server';

import { depositAmountController } from './controllers';
import { depositSchema } from './schemas';
import { getProfileMiddleware } from '../auth/middlewares';
import { schemaValidatorMiddleware } from '../core/middlewares';

const baseAuthRouter = path('/balances').middlewares([getProfileMiddleware]);
export const depositRouter = pathNested<typeof baseAuthRouter>()('/deposit/<userId: number>').middlewares([
  schemaValidatorMiddleware(depositSchema),
]);

export default baseAuthRouter.nested([depositRouter.nested([depositAmountController])]);
