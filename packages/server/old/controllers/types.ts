import { HTTPMethodEnum } from "./enums"
import Request from "../request";
import Middleware from "../middlewares";
import Response from "../response";


export type FunctionControllerType<T = unknown> = (this: T, request: Request) => Response | Promise<Response>

export type ControllerHandlerType<T = unknown, O = any> = {
  path?: string;
  options?: O;
  handler: FunctionControllerType<T>;
  middlewares?: (typeof Middleware)[];
}

export type VariableControllerType<T = unknown, O = any> = {
  [key in HTTPMethodEnum]?: ControllerHandlerType<T, O> | FunctionControllerType<T>;
}

export type ClassHandler<T = unknown, O = any> =
  VariableControllerType<T, O> &
  {
    options?: O;
    path?: string;
    middlewares?: (typeof Middleware)[];
  }

export type This<T extends new(...args: any) => any> = {
  new(...args: ConstructorParameters<T>): any
} & Pick<T, keyof T>
