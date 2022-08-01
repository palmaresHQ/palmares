import { path } from "@palmares/server"

export default [
  path("/teste", [
    path("/hello", {
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
    ]),
  ]),
]
