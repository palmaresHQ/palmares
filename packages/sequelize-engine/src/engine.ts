import {
  Engine,
  DatabaseConfigurationType,
  models,
  ModelFields
} from "@palmares/databases";
import { Sequelize, Dialect, Options, Op, Model, ModelCtor, Optional } from 'sequelize';

import { InitializedModelsType } from "./types";
import SequelizeEngineFields from "./fields";
import ModelTranslator from "./model";

export default class SequelizeEngine<M extends models.Model = models.Model> extends Engine {
  #isConnected: boolean | null = null;
  #modelTranslator!: ModelTranslator;
  _initializedModels: InitializedModelsType<Model> = {};
  instance!: Sequelize | null;
  fields!: SequelizeEngineFields;

  ModelType!: ModelCtor<Model<ModelFields<M>, Optional<ModelFields<M>, 'id'>>>;

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
    match: Op.match
  }

  constructor(databaseName: string, sequelizeInstance: Sequelize) {
    super(databaseName);
    this.fields = new SequelizeEngineFields(this);
    this.instance = sequelizeInstance;
    this.#modelTranslator = new ModelTranslator(this, this.fields);
  }

  static async new(
    databaseName: string,
    databaseSettings: DatabaseConfigurationType<Dialect, Options>
  ): Promise<Engine> {
    const isUrlDefined: boolean = typeof databaseSettings.url === "string";
    if (isUrlDefined) {
      const databaseUrl: string = databaseSettings.url || ''
      const sequelizeInstance = new Sequelize(databaseUrl, databaseSettings.extraOptions);
      return new this(databaseName, sequelizeInstance);
    }

    const sequelizeInstance = new Sequelize(
      databaseSettings.databaseName,
      databaseSettings.username,
      databaseSettings.password,
      {
        host: databaseSettings.host,
        port: databaseSettings.port,
        dialect: databaseSettings.dialect,
        ...databaseSettings.extraOptions
      }
    );
    return new this(databaseName, sequelizeInstance);
  }

  async isConnected(): Promise<boolean> {
    const isConnectedDefined: boolean = typeof this.#isConnected === "boolean";
    if (isConnectedDefined) return this.#isConnected ? true : false;

    const isSequelizeInstanceDefined = this.instance instanceof Sequelize;
    if (isSequelizeInstanceDefined) {
      await this.instance?.authenticate();
      try {
        await this.instance?.authenticate();
        this.#isConnected = true;
      } catch (error) {
        this.#isConnected = false;
      }

      if (this.#isConnected) return this.#isConnected;
    }

    this.instance = null;
    return await super.isConnected();
  }

  async initializeModel(
    model: models.Model
  ): Promise<ModelCtor<Model> | undefined> {
    const modelInstance = await this.#modelTranslator.translate(model);
    this._initializedModels[model.name] = modelInstance;
    await this.fields.afterModelCreation(model.name);
    return modelInstance;
  }
}

