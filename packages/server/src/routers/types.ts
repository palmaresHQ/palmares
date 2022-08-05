import { Router } from ".";
import { HTTPMethodEnum } from "../controllers/enums";
import { VariableControllerType, ControllerHandlerType } from "../controllers/types";
import Middleware from "../middlewares";

export type RouterParametersType = VariableControllerType | typeof Middleware | Promise<Router> | Promise<{ default: Router }>;

export type HandlersOfRouterType = ControllerHandlerType & {
  methodType: HTTPMethodEnum;
  middlewares: typeof Middleware[];
};

export type BaseRoutesType = [string, HandlersOfRouterType[]];
