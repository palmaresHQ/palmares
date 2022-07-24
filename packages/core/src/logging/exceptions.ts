export class ExistingMessageException extends Error {
  constructor(messageName: string) {
    super(`Message ${messageName} already exists, you might want to use a different name.`);
    this.name = ExistingMessageException.name;
  }
}

export class MessageDoesNotExistException extends Error {
  constructor(messageName: string) {
    super(`Message ${messageName} does not exist.`);
    this.name = MessageDoesNotExistException.name;
  }
}
