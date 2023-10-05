import { path, pathNested } from '@palmares/server';

import { getProfileMiddleware } from '../auth/middlewares';
import { depositAmountController } from './controllers';
import { schemaValidatorMiddleware } from '../core/middlewares';
import { depositSchema } from './schemas';

const baseAuthRouter = path().middlewares([getProfileMiddleware]);
const balanceRouter = pathNested<typeof baseAuthRouter>()('/balances');
export const depositRouter = pathNested<typeof balanceRouter>()('/deposit/<userId: number>').middlewares([
  schemaValidatorMiddleware(depositSchema),
]);

export default baseAuthRouter.nested([balanceRouter.nested([depositRouter.nested([depositAmountController])])]);
