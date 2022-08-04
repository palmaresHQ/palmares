import { HTTPMethodEnum } from "./enums"
import Request from "../request";
import Middleware from "../middlewares";

export type FunctionControllerType = (request: Request) => any;//Response | Promise<Response>

export type ControllerHandlerType<C extends object = {}> = {
  path?: string;
  custom?: C;
  handler: FunctionControllerType;
  middlewares?: typeof Middleware[];
}

export type VariableControllerType<C extends object = {}> = {
  [key in HTTPMethodEnum]?: ControllerHandlerType<C> | FunctionControllerType;
}
