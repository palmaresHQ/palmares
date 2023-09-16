import { path } from '@palmares/server';
import { paramsController, errorController } from './controllers';

export const baseRouter = path('/hello/<test:number>/hey/<heloo:number>?test=string');
export const errorRouter = path('/error');

export default path('').nested([baseRouter.nested([paramsController]), errorRouter.nested([errorController])]);
