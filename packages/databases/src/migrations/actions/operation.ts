import State from "../state";
import Migration from "../migration";
import Engine from "../../engine";
import { MigrationFromAndToStateModelType, ActionToGenerateType } from './types';

/**
 * Actions are the operations that we do in each migration.
 *
 * Instead of needing to create a migration file with the changes we already did to the models
 * the database will look through all of the models and see the changes so we can apply the actions.
 *
 * The idea for migrations is that instead of creating a json with the state of the models
 * (other solutions made that: https://github.com/flexxnn/sequelize-auto-migrations)
 * what we do is that by creating our own migration files and models, we have full control over
 * what changed from one model to the other. And with that the migrations actually hold the state of
 * the models
 *
 * When we want to know what changed it's simple: just start from the first migration to the last and
 * modify the model based on that.
 *
 * By the end of the state generation we will probably have the same models.
 *
 * IMPORTANT: The order of the migrations is crucial for this to work, if you change the order of any of the
 * migrations it will crash.
 */
export class Operation {
  async stateForwards(state: State, domainName: string, domainPath: string): Promise<void> {}
  async run(
    migration: Migration,
    engineInstance: Engine,
    fromState: MigrationFromAndToStateModelType,
    toState: MigrationFromAndToStateModelType
  ): Promise<void> {}

  static async defaultToGenerate<T>(domainName: string, domainPath: string, modelName: string, data: T): Promise<ActionToGenerateType<T>> {
    return {
      action: this.name,
      domainName: domainName,
      domainPath: domainPath,
      modelName: modelName,
      order: 0,
      dependsOn: [],
      data: data
    }
  }

  static async defaultToString<T>(ident: number = 0, data: ActionToGenerateType<T>): Promise<string> {
    return ''
  }
}
