import Engine from ".";
import { AllOptionalModelFields, AllRequiredModelFields, ModelFields, TModel } from "../models/types";

/**
 * Offers >>>>BASIC<<<< querying functionalities, this enables us to create libs that works well on every
 * database engine without needing to specify a database engine. We usually advise AGAINST using this on
 * real projects since this is not really well optimized for many operations like joins, select only a bunch of fields
 * and so on.
 *
 * By default this will query for all of the fields in the database, so they are all non optimized. It's preferred
 * to use the engine directly for querying. Although this not advised this enables us to create functionalities
 * that can work well on every engine. This is also really easy to implement for people that want to create new
 * database engines.
 *
 * The basic methods `get`, `set` and `remove` have the API idea taken of the browser's `localhost` and also
 * from `redis`. This guarantees this can work on most kind of databases without issues.
 */
export default class EngineQuery {
  engineInstance: Engine;

  constructor(engineInstance: Engine) {
    this.engineInstance = engineInstance;
  }

  getModelInstance(model: TModel) {
    return (model.constructor as any).default.getInstance(this.engineInstance.databaseName);
  }

  async get<M extends TModel>(
    instance: any,
    search?: AllOptionalModelFields<M>
  ): Promise<null | AllRequiredModelFields<M>[]> {
    return null;
  }

  async set<M extends TModel>(
    instance: any,
    data: ModelFields<M>,
    search?: AllOptionalModelFields<M>
  ): Promise<boolean> {
    return false;
  }

  async remove<M extends TModel>(
    instance: any,
    search?: AllOptionalModelFields<M>
  ): Promise<boolean> {
    return false;
  }
}
