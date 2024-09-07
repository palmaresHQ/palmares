export class SettingsNotFoundException extends Error {
  constructor() {
    super(
      `No settings file was found for the application.\nMake sure you either pass an option through:` +
        `\n-'Command.handleCommands'\n-PALMARES_SETTINGS_MODULE environment variable\n-Or inside` +
        ` 'src' folder in the root directory`
    );
  }
}
