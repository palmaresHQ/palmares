import { path } from "@palmares/server"

import { ExpressCorsMiddleware } from "./middlewares";

export default [
  path("/teste", ExpressCorsMiddleware, [
    path("/<hello>", {
      GET: {
        handler: (request) => {
          return "Hello world"
        }
      }
    }),
    path("", [
      path('/alou', {
        POST: {
          handler: (request) => {
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
    ]),
  ]),
]
