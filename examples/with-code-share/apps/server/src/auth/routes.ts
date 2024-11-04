import { path } from '@palmares/server';

import { getUsersController } from './controllers';

export const usersPath = path('/users?cursor=number?&search=string?');

export const routes = usersPath.nested([getUsersController]);

export default routes;
