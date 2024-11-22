export class CommandNotFoundException extends Error {
  constructor(commandName: string) {
    super(
      `Command "${commandName}" not found, you can use "node manage.(ts/js) help" ` +
        `to see all commands available in the application.`
    );
  }
}

export class RequiredPositionalArgs extends Error {
  constructor(missingArgs: string[]) {
    super(`Missing required positional arguments: ${missingArgs.join(', ')}`);
    this.name = 'RequiredPositionalArgs';
  }
}
