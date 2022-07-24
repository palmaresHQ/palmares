import { logging } from '@palmares/core';

import { NotImplementedEngineException } from "./exceptions";
import { DatabaseConfigurationType } from "../types";
import { LOGGING_DATABASE_IS_NOT_CONNECTED, LOGGING_DATABASE_CLOSING } from "../utils";
import { EngineType } from "./types";
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
  databaseName!: string;
  fields: EngineFields;
  query: EngineQuery;
  migrations!: EngineMigrations;
  ModelType: any;
  instance: any;

	constructor(databaseName: string, fields: typeof EngineFields, query: typeof EngineQuery) {
    this.databaseName = databaseName;
    this.fields = new fields(this);
    this.query = new query(this);
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

	async isConnected(): Promise<boolean> {
		await logging.logMessage(LOGGING_DATABASE_IS_NOT_CONNECTED, { databaseName: this.databaseName });
		return false;
	}

	async close(): Promise<void> {
		await logging.logMessage(LOGGING_DATABASE_CLOSING, { databaseName: this.databaseName });
	}

	async initializeModel(
    model: Model
	): Promise<any> {
		throw new NotImplementedEngineException('initializeModel');
  }

  async transaction() {}
}

export { EngineQuery, EngineFields, EngineMigrations };
