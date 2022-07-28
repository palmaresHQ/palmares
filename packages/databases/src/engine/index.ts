import { logging } from '@palmares/core';

import { NotImplementedEngineException } from "./exceptions";
import { DatabaseConfigurationType } from "../types";
import { LOGGING_DATABASE_IS_NOT_CONNECTED, LOGGING_DATABASE_CLOSING } from "../utils";
import { EngineType, EngineInitializedModels } from "./types";
import EngineFields from "./fields";
import EngineMigrations from './migrations';
import EngineQuery from './query';
import { Model } from '../models/model';

/**
 * Instead of creating our own ORM for the framework we wrap any orm we want to use inside of this class. This allow
 * our framework to have a consistent API for all ORMs that the user wants to use so he will not need to change much
 * of his code if he just wants to build a different orm.
 */
export default class Engine implements EngineType {
  databaseName: string;
  databaseSettings: DatabaseConfigurationType<any, any>
  initializedModels: EngineInitializedModels = {};
  fields: EngineFields;
  query: EngineQuery;
  migrations: EngineMigrations;
  ModelType: any;
  instance: any;

	constructor(
    databaseName: string,
    databaseSettings: DatabaseConfigurationType<any, any>,
    fields: typeof EngineFields,
    query: typeof EngineQuery,
    migration: typeof EngineMigrations
  ) {
    this.databaseName = databaseName;
    this.databaseSettings = databaseSettings;
    this.fields = new fields(this);
    this.query = new query(this);
    this.migrations = new migration(this, this.fields);
	}

	/**
	 * Factory function for creating a new Engine instance. Your engine should always implement this function
	 * as static and return a new instance of your engine.
	 */
	static async new(
		databaseName: string,
		databaseSettings: DatabaseConfigurationType<string, {}>
	): Promise<Engine> {
		throw new NotImplementedEngineException('new');
	}

  async duplicate(): Promise<Engine> {
    const newInstance = await (this.constructor as typeof Engine).new(this.databaseName, this.databaseSettings);
    newInstance.initializedModels = {...this.initializedModels};
    return newInstance
  }

	async isConnected(): Promise<boolean> {
		await logging.logMessage(LOGGING_DATABASE_IS_NOT_CONNECTED, { databaseName: this.databaseName });
		return false;
	}

	async close(): Promise<void> {
		await logging.logMessage(LOGGING_DATABASE_CLOSING, { databaseName: this.databaseName });
	}

	async initializeModel(
    model: Model,
    modelInstance?: any
	): Promise<any> {
    this.initializedModels[model.name] = modelInstance;
		return modelInstance;
  }


  async transaction<P extends Array<any>, R>(
    callback: (transaction: any, ...args: P) => R | Promise<R>,
    ...args: P
  ): Promise<R> {
    const transact = undefined;
    return await Promise.resolve(callback(transact, ...args))
  }
}

export { EngineQuery, EngineFields, EngineMigrations };
