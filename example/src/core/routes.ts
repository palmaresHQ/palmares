import { path } from "@palmares/server"
import { ExampleController } from "./controllers";

import { ExpressCorsMiddleware } from "./middlewares";

export default [
  path("/teste", ExpressCorsMiddleware,
    path("/<hello>", ExampleController.new())
  ),
]
