import { DatabaseSettingsType } from "../../types";

export default class Migrate {
  settings: DatabaseSettingsType;

  constructor(settings: DatabaseSettingsType) {
    this.settings = settings;
  }

  static async buildAndRun(settings: DatabaseSettingsType) {

  }
}
