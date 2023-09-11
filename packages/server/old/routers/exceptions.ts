export class MoreThanOneHandlerForSamePathError extends Error {
  constructor() {
    super('We`ve found more than one handler for the same path.');
    this.name = MoreThanOneHandlerForSamePathError.name;
  }
}
