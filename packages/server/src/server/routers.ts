import Server from ".";
import { Router } from "../routers";

export default class ServerRouters {
  server: Server;

  constructor(server: Server) {
    this.server = server;
  }

  setRouters(routers: Router[]) {
    null;
  }
}
