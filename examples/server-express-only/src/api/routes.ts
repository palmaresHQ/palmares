import { path } from '@palmares/server';
import controller from './controllers';

export const baseRouter = path('/hello/<test:number>/hey/<heloo:number>?test=string');
export default baseRouter.nested([controller]);
