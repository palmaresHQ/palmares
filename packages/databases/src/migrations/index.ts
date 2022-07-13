import { DatabaseDomain } from "../domain";
import { DatabaseSettingsType } from "../types";

import path from "path";

export default class Migrations {
  settings: DatabaseSettingsType;
  domains: DatabaseDomain[];

  constructor(settings: DatabaseSettingsType, domains: DatabaseDomain[]) {
    this.settings = settings;
    this.domains = domains;
  }

  async makeMigrations() {
    console.log('hey')
  }

  async #getMigrations() {
    /*const foundModels: any[] = [];
    const promises: Promise<void>[] = this.domains.map(async (domain) => {
      const hasGetModelsMethodDefined = typeof domain.getMigrations === 'function';
      if (hasGetModelsMethodDefined) {
        const models = await Promise.resolve(domain.getMigrations());
        models.forEach((model) => {
          foundModels.push({
            domainPath: domain.path,
            domainName: domain.name,
            model
          });
        });
      } else {
        const fullPath = path.join(domain.path, 'models');
        try {
          const models = await import(fullPath);
          const modelsArray: typeof Model[] = Object.values(models);

          for (const model of modelsArray) {
            if (model.prototype instanceof Model) {
              foundModels.push({
                  model,
                  domainName: domain.name,
                  domainPath: domain.path,
              })
            }
          }
        } catch (e) {
          const error: any = e;
          if (error.code === ERR_MODULE_NOT_FOUND) {
            await logging.logMessage(LOGGING_DATABASE_MODELS_NOT_FOUND, { domainName: fullPath });
          } else {
            throw e;
          }
        }
      }
    });
    await Promise.all(promises);
    return foundModels;*/
  }
}
