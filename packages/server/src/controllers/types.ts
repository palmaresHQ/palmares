import { HTTPMethodEnum } from "./enums"
import Request from "../request";
import Middleware from "../middlewares";
import Response from "../response";


export type FunctionControllerType<O extends object | undefined = {}, T = unknown> =
  O extends undefined ?
  (this: T, request: Request, options?: O) => Response | Promise<Response> :
  (this: T, request: Request, options: O) => Response | Promise<Response>;

export type ControllerHandlerType<O extends object = {}, T = unknown> = {
  path?: string;
  options?: O;
  handler: FunctionControllerType<O, T>;
  middlewares?: (typeof Middleware)[];
}

export type VariableControllerType<O extends object = {}, T = unknown> = {
  [key in HTTPMethodEnum]?: ControllerHandlerType<O, T> | FunctionControllerType<O, T>;
}

export type ClassHandler<T, O extends object | undefined = undefined> =
  VariableControllerType<O extends undefined ? {} : O, T> &
  {
    path?: string;
    middlewares?: (typeof Middleware)[];
  }
  &
  (O extends undefined ?
  {
    options?: O;
  } :
  {
    options: O;
  })


type Path<P extends string> =
  P extends `<${infer R}${': '}${infer T}>` ? [R, T extends `string` ? string : number] :
  P extends `<${infer R}>${infer T}` ? [R, string, TrimLeft<T>] :
  P extends `<${infer R}>` ? [R, string] : never;

type TrimLeft<P extends string> =
  P extends `/${infer R}` ?
  TrimLeft<R> :
  Path<P>

type BuildPath<P extends string> = TrimLeft<P> extends [infer Key extends string, infer T] ? { [K in Key]: T }: never

type teste = BuildPath<'/<id>/<teste>'>;
