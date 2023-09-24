import { path } from '@palmares/server';
import {
  blobResponseController,
  jsonController,
  textController,
  streamController,
  arrayBufferController,
  fileController,
  errorController,
} from './controllers';

export const blobRouter = path('/blob');
export const arrayBufferRouter = path('/array-buffer');
export const fileRouter = path('/file');
export const jsonRouter = path('/json');
export const textRouter = path('/text');
export const streamRouter = path('/stream');
export const errorRouter = path('/error');

export default path('/responses').nested([
  blobRouter.nested([blobResponseController]),
  arrayBufferRouter.nested([arrayBufferController]),
  fileRouter.nested([fileController]),
  jsonRouter.nested([jsonController]),
  textRouter.nested([textController]),
  streamRouter.nested([streamController]),
  errorRouter.nested([errorController]),
]);
