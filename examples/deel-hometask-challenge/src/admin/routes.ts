import { path, pathNested } from '@palmares/server';
import { bestClientsController, bestProfessionController } from './controllers';

const baseAdminRouter = path(
  '/admin?start={\\d\\d\\d\\d-\\d\\d-\\d\\d}:string&end={\\d\\d\\d\\d-\\d\\d-\\d\\d}:string'
);
export const bestProfessionRouter = pathNested<typeof baseAdminRouter>()('/best-profession');
export const bestClientsRouter = pathNested<typeof baseAdminRouter>()('/best-clients?limit=number?');

export default baseAdminRouter.nested([
  bestProfessionRouter.nested([bestProfessionController]),
  bestClientsRouter.nested([bestClientsController]),
]);
