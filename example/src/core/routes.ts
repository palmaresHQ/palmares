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
        GET: {
          handler: (request) => {
            return "Hello world"
          }
        }
      }),
    ]),
  ]),
]
