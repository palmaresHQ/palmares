import { path, pathNested } from '@palmares/server';

import { payJobIdController, unpaidJobsController } from './controllers';
import { payForJobSchema } from './schemas';
import { getProfileMiddleware } from '../auth/middlewares';
import { schemaValidatorMiddleware } from '../core/middlewares';

const baseJobsRouter = path('/jobs').middlewares([getProfileMiddleware]);
export const unpaidJobsRouter = pathNested<typeof baseJobsRouter>()('/unpaid');
export const payJobIdRouter = pathNested<typeof baseJobsRouter>()('/<jobId: number>/pay').middlewares([
  schemaValidatorMiddleware(payForJobSchema)
]);

export default baseJobsRouter.nested([
  unpaidJobsRouter.nested([unpaidJobsController]),
  payJobIdRouter.nested([payJobIdController])
]);
