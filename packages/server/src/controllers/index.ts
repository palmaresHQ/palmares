import { Router } from "../routers";

/**
 * Controllers are just an specialized router. It offers the same functionality as a router but also offers the ability to set
 * other custom parameters.
 */
export default class Controller extends Router {
  [key: string]: any;
}
