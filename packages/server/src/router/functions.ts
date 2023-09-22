import { MethodsRouter } from './routers';
import type { DefaultRouterType } from './types';

export function path<TPath extends string = ''>(path: TPath = '' as TPath) {
  return MethodsRouter.new(path);
}

export function pathNested<TParentRouter extends DefaultRouterType>() {
  return <TPath extends string = ''>(path: TPath = '' as TPath) => MethodsRouter.newNested<TParentRouter>()(path);
}
