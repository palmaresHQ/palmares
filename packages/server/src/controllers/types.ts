import { HTTPMethodEnum } from "./enums"
import Request from "../request";
import Middleware from "../middlewares";

export type FunctionControllerType<O extends object | undefined = {}> =
  O extends undefined ?
  (request: Request, options?: O) => any | Promise<any> :
  (request: Request, options: O) => any | Promise<any>;//Response | Promise<Response>

export type ControllerHandlerType<O extends object = {}> = {
  path?: string;
  options?: O;
  handler: FunctionControllerType<O>;
  middlewares?: typeof Middleware[];
}

export type VariableControllerType<O extends object = {}> = {
  [key in HTTPMethodEnum]?: ControllerHandlerType<O> | FunctionControllerType<O>;
}

export type ClassHandler<O extends object | undefined = undefined> =
  VariableControllerType<O extends undefined ? {} : O> &
  {
    path?: string;
    middlewares?: typeof Middleware[];
  }
  &
  (O extends undefined ?
  {
    options?: O;
  } :
  {
    options: O;
  })
