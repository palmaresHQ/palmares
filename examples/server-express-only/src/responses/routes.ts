import { path } from '@palmares/server';
import { blobResponseController, jsonController, textController } from './controllers';

export const blobResponseRouter = path('/blob');
export const jsonRouter = path('/json');
export const textRouter = path('/text');
export const arrayBufferRouter = path('/array-buffer');

export default path('/responses').nested([
  blobResponseRouter.nested([blobResponseController]),
  jsonRouter.nested([jsonController]),
  textRouter.nested([textController]),
]);
