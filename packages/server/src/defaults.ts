import Request from "./request";
import Response from "./response";
import { HTTP_404_NOT_FOUND } from "./status";

export async function default404handler(request: Request) {
  return Response.new(HTTP_404_NOT_FOUND, { body: `Not found ${request.path}`})
}
