import { path } from '@palmares/server';
import { paramsController, errorController, jsonController, formDataController } from './controllers';

export const baseRouter = path('/hello/<test:number>/hey/<heloo:number>?test=string');
export const errorRouter = path('/error');
export const jsonRouter = path('/json');
export const formDataRouter = path('/form');

export default path('').nested([
  baseRouter.nested([paramsController]),
  errorRouter.nested([errorController]),
  jsonRouter.nested([jsonController]),
  formDataRouter.nested([formDataController]),
]);
