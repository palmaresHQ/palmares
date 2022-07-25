import State from "../state";
import Migration from "../migrate/migration";
import Engine from "../../engine";
import { MigrationFromAndToStateModelType, ActionToGenerateType, ToStringFunctionReturnType } from './types';

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
  /**
   * Function that will be used to construct and build the state of all of the models in the application so we
   * can compare to the original ones.
   *
   * @param state - A state instance that holds all of the models of the application before.
   * @param domainName - The name of the domain where this model was defined.
   * @param domainPath - The path of the domain where this model exists so we can add the migration file there.
   */
  async stateForwards(state: State, domainName: string, domainPath: string): Promise<void> {}

  /**
   * Method that runs when a migration is running on a migration file, when this happens we will call the exact
   * function of the engine migrations.
   *
   * We also have the fromState (which will be state when the state) which will be the state of the models
   * before running the migration and `toState` will be state AFTER running the migration
   */
  async run(
    migration: Migration,
    engineInstance: Engine,
    fromState: MigrationFromAndToStateModelType,
    toState: MigrationFromAndToStateModelType
  ): Promise<void> {}

  static async defaultToGenerate<T>(domainName: string, domainPath: string, modelName: string, data: T): Promise<ActionToGenerateType<T>> {
    return {
      operation: this,
      domainName: domainName,
      domainPath: domainPath,
      modelName: modelName,
      order: 0,
      dependsOn: [],
      data: data
    }
  }

  static async toString(indentation: number=0, data: ActionToGenerateType<any>): Promise<ToStringFunctionReturnType> {
    return {
      asString: ''
    };
  }

  static async defaultToString(indentation: number = 0, customAttributesOfAction: string = ''): Promise<string> {
    const ident = '  '.repeat(indentation);
    return `${ident}new actions.${this.name}(`+
    `${customAttributesOfAction !== '' ?`\n${customAttributesOfAction}\n${ident}` : '' }`+
    `)`
  }

  static async describe(data: ActionToGenerateType<any>): Promise<string> {
    return '';
  }
}
