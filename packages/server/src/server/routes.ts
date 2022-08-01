import Server from ".";
import { ControllerHandlerType, FunctionControllerType } from "../controllers/types";
import { BaseRoutesType } from "../routers/types";
import { NotImplementedServerException } from "./exceptions";

/**
 * This class is responsible for translating the routes to something that the lib can understand.
 * Those routes will be loaded in the server.
 */
export default class ServerRoutes {
  server: Server;

  constructor(server: Server) {
    this.server = server;
  }

  async translateHandler(handler: FunctionControllerType): Promise<FunctionControllerType> {
    return handler;
  }

  async translatePath(path: string): Promise<string> {
    return path;
  }

  async initialize(routes: BaseRoutesType[]): Promise<void> {
    throw new NotImplementedServerException('initialize');
  }
}
