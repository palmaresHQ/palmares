import { Request } from "express";

import {
  ServerRequests,
  Request as PalmaresRequest,
  QueryParamsType,
  HeadersType,
} from "@palmares/server";

export default class ExpressRequests extends ServerRequests {
  async translate(request: Request): Promise<PalmaresRequest> {
    return await PalmaresRequest.new<Request>(
      request.method,
      request.hostname,
      request.url,
      request.params,
      request.query as QueryParamsType,
      request.headers as HeadersType,
      request.headers['content-type'] as string,
      undefined,
      request
    );
  }
}
