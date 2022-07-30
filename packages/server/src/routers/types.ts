import { Router } from ".";
import { HTTPMethodEnum } from "../controllers/enums";
import { VariableControllerType, ControllerHandlerType } from "../controllers/types";
import Middleware from "../middlewares";

export type RouterParametersType = VariableControllerType | Array<Promise<Router>>;

export type HandlersOfRouterType = {
  methodType: HTTPMethodEnum;
} & ControllerHandlerType;

export type BaseRoutesType = [string, HandlersOfRouterType[]];
