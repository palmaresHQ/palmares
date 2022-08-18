export default class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class FieldSourcesError extends Error {
  constructor(className: string, source: string, instance: any) {
    super(`The source '${source}' defined in '${className}' does not exist in instance: ${JSON.stringify(instance)}`);
    this.name = 'FieldSourcesError';
  }
}
