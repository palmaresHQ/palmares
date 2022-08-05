import { path } from "@palmares/server"
import { ExampleController } from "./controllers";

import { ExpressCorsMiddleware } from "./middlewares";

export default [
  path("/teste", ExpressCorsMiddleware,
    path("/<hello>", ExampleController.new()),
    path("",
      path('/alou', {
        POST: {
          handler: (request, options) => {
            return "Hello world"
          }
        }
      }),
      path('/withMiddie', {
        POST: {
          handler: (request) => {
            return "Hello world"
          }
        }
      }),
    ),
  ),
]
