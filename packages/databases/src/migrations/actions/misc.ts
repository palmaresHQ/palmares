import Engine from "../../engine";
import Migration from "../migration";
import { StateModelsType } from "../types";
import { Operation } from "./operation";
import { CodeFunctionType, MigrationFromAndToStateModelType } from "./types";

/**
 * Run a Javascript function action, this action can make queries or requests.
 * Usually we pass a transaction to your code, and the migration runs inside of a transaction.
 * We recommend always using the transaction object of the migration.
 *
 * This will guarantee that if anything fails the changes will not be commited to the database.
 *
 * At the same time we send the engine instance and the state.
 *
 * Instead of importing your models and making queries directly, always try to use `state`.
 * `state` is a object where each key is the Model name. This will guarantee that your state is up to date when
 * the query is running.
 *
 * For example: You create a query like
 * ```
 * import Field from 'models';
 *
 * Field.instance.findOne({
 *   where: {
 *     createdAt: yesterday
 *   }
 * })
 * ```
 *
 * But many migrations later you delete the `createdAt` attribute from your model. If you import this model directly this
 * query will fail when you run the query again. So instead you should make it like this
 *
 * ```
 * const { Field, ...rest } = state
 *
 * Field.instance.findOne({
 *   where: {
 *     createdAt: yesterday
 *   }
 * })
 * ```
 *
 * This will get the state when the query is running so the model is up to date of the migration evaluation.
 */
export class RunJs extends Operation {
  code: CodeFunctionType;

  constructor(code: CodeFunctionType) {
    super();
    this.code = code;
  }

  async run(migration: Migration, engineInstance: Engine, _: MigrationFromAndToStateModelType, toState: MigrationFromAndToStateModelType): Promise<void> {
    const stateModels = {} as StateModelsType;
    const modelNamesAlreadyAvailable = Object.keys(toState);
    for (const modelName of modelNamesAlreadyAvailable) {
      stateModels[modelName] = toState[modelName].original;
    }
    await Promise.resolve(this.code(migration, engineInstance, stateModels));
  }
}
