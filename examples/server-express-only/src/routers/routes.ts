import { path, pathNested } from '@palmares/server';
import { routerController, allController } from './controllers';

export const baseRouter = path('/router');
export const allRouter = pathNested<typeof baseRouter>()('/all');

export default path('').nested([baseRouter.nested([routerController, allRouter.nested([allController])])]);
