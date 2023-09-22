import { middleware, path } from '@palmares/server';
import {
  paramsController,
  errorController,
  jsonController,
  formDataController,
  formUrlEncodedController,
  textController,
  blobController,
  queryAndUrlParamsController,
  arrayBufferController,
} from './controllers';

export const baseRouter = path('/hello/<test:number>/hey/<heloo:number>?test=string').middlewares([
  middleware({
    request: (request) => {
      const clonedRequest = request.clone<{ headers: { 'x-authentication': string } }>();
      return clonedRequest;
    },
  }),
]);
export const errorRouter = path('/error');
export const jsonRouter = path('/json');
export const formDataRouter = path('/form');
export const formUrlEncodedRouter = path('/urlencoded');
export const textRouter = path('/text');
export const blobRouter = path('/blob');
export const arrayBufferRouter = path('/arraybuffer');

export const queryAndUrlParamsRouter = path('');

export default path('').nested([
  baseRouter.nested([paramsController]),
  errorRouter.nested([errorController]),
  jsonRouter.nested([jsonController]),
  formDataRouter.nested([formDataController]),
  textRouter.nested([textController]),
  blobRouter.nested([blobController]),
  arrayBufferRouter.nested([arrayBufferController]),
  formUrlEncodedRouter.nested([formUrlEncodedController]),
  queryAndUrlParamsRouter.nested([queryAndUrlParamsController]),
]);
