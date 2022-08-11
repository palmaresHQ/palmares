import { path } from "@palmares/server"
import { ExampleController } from "./controllers";

import { CorsMiddleware, ExpressCorsMiddleware } from "./middlewares";

export default [
  path("/teste", ExpressCorsMiddleware, CorsMiddleware,
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
