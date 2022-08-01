import Server from ".";
import { BaseRoutesType } from "../routers/types";
import { CannotParsePathParameterException, NotImplementedServerException } from "./exceptions";
import { PathParamsTypes, PathParams } from "./types";

/**
 * This class is responsible for translating the routes to something that the lib can understand.
 * Those routes will be loaded in the server.
 */
export default class ServerRoutes {
  server: Server;

  constructor(server: Server) {
    this.server = server;
  }

  /**
   * This is used to retrieve the parameters of the path if it has any.
   *
   * By default we do not use `:parameter` as custom path parameters we are using `<label: type_or_regex>`.
   * Most frameworks use `:parameter` as custom path parameters so we need to translate from
   * `<label: type_or_regex>` to `:label`.
   *
   * We do not translate this by default, you need to create your own custom translator for the framework
   * that you are using.
   *
   * @param path - The path to be translated.
   *
   * @returns - A promise that resolves to an array of path parameters.
   */
  async #getPathParameters(path: string): Promise<PathParams[]> {
    const valueRegex = /^<\w+:/;
    const regexPath = /<(\w+)\s*:\s*(.+)>/g;
    const nonRegexPath = /<(\w+)\s*:\s*(string|number)>/g;

    const isNonRegexPath = nonRegexPath.test(path);
    const isRegexPath = regexPath.test(path);
    if (isNonRegexPath) {
      const allMatches = path.match(nonRegexPath) || [];
      return allMatches.map(match => {
        const valueOfMatch = match.match(valueRegex);
        if (valueOfMatch) {
          const paramName = valueOfMatch[0].replace(/(\s|:|^<)/g, '');
          const paramType = match.replace(valueOfMatch[0], '').replace(/\s|>$/g, '');
          const isOfTypeStringOrNumber = paramType === 'string' || paramType === 'number';
          if (isOfTypeStringOrNumber) {
            return {
              value: match,
              paramName,
              paramType: paramType as "string" | "number"
            }
          }
        }
        throw new CannotParsePathParameterException(path, match);
      });
    }
    if (isRegexPath) {
      const allMatches = path.match(regexPath) || [];
      return allMatches.map(match => {
        const valueOfMatch = match.match(valueRegex);
        if (valueOfMatch) {
          const paramName = valueOfMatch[0].replace(/(\s|:|^<)/g, '');
          const paramType = new RegExp(match.replace(valueOfMatch[0], '').replace(/\s|>$/g, ''));
          return {
            value: match,
            paramName,
            paramType
          }
        }
        throw new CannotParsePathParameterException(path, match);
      });
    }
    return [];
  }

  /**
   * This will return the paths translated to the framework that you are using. Normally the we define how parameters
   * should be defined inside of the framework. For example, if you are using Express, you can define the parameters
   * like this:
   * ```
   * app.get('/:id', (req, res) => {
   *  const id = req.params.id;
   *  res.send(id);
   * });
   * ```
   *
   * On palmares on the other hand, we would define the parameters like this:
   * ```
   * path('/<id: number>', (request) => {
   *  const id = request.params.id;
   *  return id;
   * })
   * ```
   *
   * @param path - The path to be translated and formatted to something that the framework is able to understand.
   *
   * @returns - A promise that resolves to the path translated to the framework that is being used.
   */
  async getPath(path: string): Promise<string> {
    let formattedPath = path;
    const pathParameters = await this.#getPathParameters(path);
    const promises = pathParameters.map(async (pathParameter) => {
      const translatedParameter = await this.translatePathParameter(pathParameter.paramName, pathParameter.paramType);
      formattedPath = formattedPath.replace(pathParameter.value, translatedParameter);
    });
    await Promise.all(promises);
    return formattedPath;
  }

  async translatePathParameter(name: string, type: PathParamsTypes): Promise<string> {
    throw new NotImplementedServerException('translatePathParameter');
  }

  async initialize(routes: BaseRoutesType[]): Promise<void> {
    throw new NotImplementedServerException('initialize');
  }
}
