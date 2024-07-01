import { path, pathNested } from '@palmares/server';

import { getProfileMiddleware } from '../auth/middlewares';
import { depositAmountController } from './controllers';
import { schemaValidatorMiddleware } from '../core/middlewares';
import { depositSchema } from './schemas';

const baseAuthRouter = path('/balances').middlewares([getProfileMiddleware]);
export const depositRouter = pathNested<typeof baseAuthRouter>()('/deposit/<userId: number>').middlewares([
  schemaValidatorMiddleware(depositSchema),
]);

export default baseAuthRouter.nested([depositRouter.nested([depositAmountController])]);
