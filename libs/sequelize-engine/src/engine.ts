import { DatabaseConfigurationType, Engine, EngineInitializedModels, ModelFields, models } from '@palmares/databases';
import { Dialect, Model, ModelCtor, Op, Options, Sequelize, Transaction } from 'sequelize';

import SequelizeEngineFields from './fields';
import SequelizeMigrations from './migrations';
import SequelizeEngineModels from './model';
import SequelizeEngineQuery from './query';

export default class SequelizeEngine<M extends models.BaseModel = any> extends Engine {
  databaseName!: string;
  #isConnected: boolean | null = null;
  declare initializedModels: EngineInitializedModels<ModelCtor<Model<ModelFields<M>>>>;
  declare instance: Sequelize | null;
  fields = new SequelizeEngineFields();
  migrations = new SequelizeMigrations();
  models = new SequelizeEngineModels();
  query = new SequelizeEngineQuery();

  declare ModelType: ModelCtor<Model<ModelFields<M>>>;

  operations = {
    and: Op.and,
    or: Op.or,
    eq: Op.eq,
    ne: Op.ne,
    is: Op.is,
    not: Op.not,
    col: Op.col,
    gt: Op.gt,
    gte: Op.gte,
    lt: Op.lt,
    lte: Op.lte,
    between: Op.between,
    notBetween: Op.notBetween,
    all: Op.all,
    in: Op.in,
    notIn: Op.notIn,
    like: Op.like,
    notLike: Op.notLike,
    startsWith: Op.startsWith,
    endsWith: Op.endsWith,
    substring: Op.substring,
    iLike: Op.iLike,
    notILike: Op.notILike,
    regexp: Op.regexp,
    notRegexp: Op.notRegexp,
    iRegexp: Op.iRegexp,
    notIRegexp: Op.notIRegexp,
    any: Op.any,
    match: Op.match,
  };

  static async new<TArgs extends Options & { url?: string }>(args: TArgs): Promise<[TArgs, Engine]> {
    const isUrlDefined: boolean = typeof args.url === 'string';
    if (isUrlDefined) {
      const databaseUrl: string = args.url || '';
      const sequelizeInstance = new Sequelize(databaseUrl, args);
      const engineInstance = new this();
      engineInstance.instance = sequelizeInstance;
      return [args, engineInstance];
    }

    const sequelizeInstance = new Sequelize(args);
    const engineInstance = new this();
    engineInstance.instance = sequelizeInstance;
    return [args, engineInstance];
  }

  async isConnected(): Promise<boolean> {
    const isConnectedDefined: boolean = typeof this.#isConnected === 'boolean';
    if (isConnectedDefined) return this.#isConnected ? true : false;
    const isSequelizeInstanceDefined = this.instance instanceof Sequelize;

    if (isSequelizeInstanceDefined) {
      try {
        await this.instance?.authenticate();
        this.#isConnected = true;
      } catch (error) {
        this.#isConnected = false;
      }

      if (this.#isConnected) return this.#isConnected;
    }
    this.instance = null;
    return false;
  }

  async initializeModel(
    _: SequelizeEngine<any>,
    model: models.BaseModel,
    defaultInitializeModelCallback: () => Promise<ModelCtor<Model>>
  ): Promise<ModelCtor<Model> | undefined> {
    const modelInstance = await defaultInitializeModelCallback();
    await this.fields.afterModelCreation(model.name);
    return modelInstance;
  }

  async transaction<TParameters extends Array<any>, TResult>(
    callback: (transaction: Transaction, ...args: TParameters) => TResult | Promise<TResult>,
    ...args: TParameters
  ): Promise<TResult> {
    return new Promise((resolve, reject) => {
      try {
        this.instance?.transaction(async (transaction) => {
          try {
            resolve(await callback(transaction, ...args));
          } catch (e) {
            reject(e);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async duplicate(getNewEngine: () => Promise<Engine>): Promise<Engine> {
    return getNewEngine();
  }

  async close(): Promise<void> {
    await Promise.resolve(this.instance?.close());
  }
}
