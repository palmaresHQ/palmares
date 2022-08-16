import Request from "./request";
import Response from "./response";
import { HTTP_404_NOT_FOUND } from "./status";

/**
 * This is our default 404 handler. It will be called whenever a route is not found inside of the palmares
 * application server.
 *
 * @param request - The request of the not found route.
 *
 * @returns - The response of the not found route. Just a simple string with `Not found '{path}'`.
 */
export async function default404handler(request: Request) {
  return Response.new(HTTP_404_NOT_FOUND, { body: `Not found ${request.path}`})
}
