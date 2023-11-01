import { DatabaseSettingsType } from './types';

export default function defaultSettings(settings: DatabaseSettingsType) {
  if (settings.databases === undefined) settings.databases = {};
  if (typeof settings.dismissNoMigrationsLog !== 'boolean') settings.dismissNoMigrationsLog = false;
  return settings;
}
