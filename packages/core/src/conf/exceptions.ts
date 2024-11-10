export class SettingsNotFoundException extends Error {
  constructor() {
    super(
      `No settings file was found for the application.\nMake sure you either pass an option through` +
        `'Command.handleCommands'`
    );
  }
}
