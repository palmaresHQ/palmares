import { HTTPMethodEnum } from "../controllers/enums";
import Middleware from "../middlewares";

function methodDecoratorFactory(method: HTTPMethodEnum, path?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const isAFunction = typeof descriptor.value === 'function';

    let handler = descriptor.value.unknown;
    if (isAFunction) {
      handler = descriptor.value;
      descriptor.value = {};
    } else delete descriptor.value.unknown;

    if (path) descriptor.value.path = path;
    descriptor.value[method] = handler;
  };
}

export const Get = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.GET, path);
export const Connect = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.CONNECT, path);
export const Delete = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.DELETE, path);
export const Head = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.HEAD, path);
export const HttpOptions = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.OPTIONS, path);
export const Patch = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.PATCH, path);
export const Post = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.POST, path);
export const Put = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.PUT, path);
export const Trace = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.TRACE, path);


export function Middlewares(...middlewares: typeof Middleware[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const isAFunction = typeof descriptor.value === 'function';
    if (isAFunction) {
      const handler = descriptor.value;
      descriptor.value = { unknown: handler };
    }
    descriptor.value.middlewares = middlewares;
  }
}

export function Options<D extends object | undefined>(options: D) {
  return function <T>(target: T, propertyKey: string, descriptor: PropertyDescriptor) {
    const isAFunction = typeof descriptor.value === 'function';
    if (isAFunction) {
      const handler = descriptor.value;
      (descriptor.value as any) = { unknown: handler };
    }
    (descriptor.value as any).options = options;
  }
}
