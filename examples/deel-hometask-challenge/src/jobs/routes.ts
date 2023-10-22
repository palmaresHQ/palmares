import { path, pathNested } from '@palmares/server';
import { getProfileMiddleware } from '../auth/middlewares';
import { payJobIdController, unpaidJobsController } from './controllers';
import { schemaValidatorMiddleware } from '../core/middlewares';
import { payForJobSchema } from './schemas';

const baseJobsRouter = path('/jobs');
export const unpaidJobsRouter = pathNested<typeof baseJobsRouter>()('/unpaid');
export const payJobIdRouter = pathNested<typeof baseJobsRouter>()('/<jobId: number>/pay').middlewares([
  schemaValidatorMiddleware(payForJobSchema),
]);

export default baseJobsRouter.nested([
  unpaidJobsRouter.nested([unpaidJobsController]),
  payJobIdRouter.nested([payJobIdController]),
]);
