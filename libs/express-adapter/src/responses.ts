import { Response, ServerResponses } from "@palmares/server";
import { Response as EResponse } from "express";

export default class ExpressResponses extends ServerResponses {
  async translateCookies(response: Response, responseConstructor?: EResponse) {
    if (responseConstructor) {
      for await (const cookie of response.getFormattedCookies()) {
        const { name, value, ...options } = cookie;
        responseConstructor.cookie(name, value, options)
      }
    }
  }

  async translateHeaders(response: Response<any>, responseConstructor?: EResponse) {
    if (responseConstructor) {
      for await (const [key, value] of response.getFormattedHeaders()) {
        responseConstructor.set(key, value);
      }
    }
  }

  async translateResponse(response: Response<any>, { res }: { res: EResponse }): Promise<EResponse | undefined> {
    if (!res.headersSent) return res.status(response.status);
  }

  async sendResponse(response: Response<any>, responseConstructor?: EResponse): Promise<void> {
    if (responseConstructor) {
      if (response.body) responseConstructor.send(response.body);
      else responseConstructor.end();
    }
  }
}
