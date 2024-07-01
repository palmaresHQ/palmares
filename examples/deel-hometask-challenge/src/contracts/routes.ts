import { path, pathNested } from '@palmares/server';

import { getProfileMiddleware } from '../auth/middlewares';
import { contractByIdController, contractsController } from './controllers';

export const baseContractRoute = path('/contracts').middlewares([getProfileMiddleware]);
export const contractByIdRoute = pathNested<typeof baseContractRoute>()('/<id: number>/<userId: string>?product_id=number');

export default baseContractRoute.nested([contractByIdRoute.nested([contractByIdController]), contractsController]);
