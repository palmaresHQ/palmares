import { DatabaseSettingsType } from "./types";

export default function defaultSettings(settings: DatabaseSettingsType) {
  if (settings.DATABASES === undefined) settings.DATABASES = {};
  if (typeof settings.DATABASES_DISMISS_NO_MIGRATIONS_LOG !== 'boolean')
    settings.DATABASES_DISMISS_NO_MIGRATIONS_LOG = false;
  return settings;
}
