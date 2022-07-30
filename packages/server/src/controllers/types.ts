import { HTTPMethodEnum } from "./enums"

export type FunctionControllerType = (request?: Request) => any;//Response | Promise<Response>

export type ControllerHandlerType<C extends object = {}> = {
  path?: string;
  custom?: C;
  handler: FunctionControllerType
}

export type VariableControllerType<C extends object = {}> = {
  [key in HTTPMethodEnum]?: {
    path?: string;
    custom?: C;
    handler: FunctionControllerType
  }
}
