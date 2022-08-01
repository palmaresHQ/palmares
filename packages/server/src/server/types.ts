export type PathParamsTypes = "string" | "number" | RegExp;

export type PathParams = {
  value: string;
  paramName: string;
  paramType: PathParamsTypes;
}
