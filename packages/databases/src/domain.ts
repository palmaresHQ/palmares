import { Domain, conf } from "@palmares/core"
import databases from "./databases";
import { DatabaseSettingsType } from "./types";


export default class DatabasesDomain extends Domain {
  constructor() {
    super(DatabasesDomain.name, __dirname);
  }

  async ready(): Promise<void> {
    const settings = conf.settings as DatabaseSettingsType;
    await databases.init(settings);
  }

  async close(): Promise<void> {
    await databases.close();
  }
}