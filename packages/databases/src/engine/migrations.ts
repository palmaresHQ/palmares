import Engine from ".";
import Migration from "../migrations/migrate/migration";
import EngineFields from "./fields";
import { InitializedModelsType } from "../types";
import { Field } from "../models/fields";

/**
 * Engine migrations enables developers to have migrations easily and automatically, no matter the orm they use.
 *
 * The hole idea of this application is to simplify and padronize the database access in our application.
 * So, instead of
 */
export default class EngineMigrations {
  engine!: Engine;
  engineFields!: EngineFields;

  constructor(engine: Engine, engineFields: EngineFields) {
    this.engine = engine;
    this.engineFields = engineFields;
  }

  async init() {}
  async addModel(toModel: InitializedModelsType, migration: Migration) {}
  async removeModel(fromModel: InitializedModelsType, migration: Migration){}
  async changeModel(toModel: InitializedModelsType, fromModel: InitializedModelsType, migration: Migration){}
  async addField(toModel: InitializedModelsType, fromModel: InitializedModelsType, fieldName: string, migration: Migration){}
  async changeField(toModel: InitializedModelsType, fromModel: InitializedModelsType, fieldBefore: Field, fieldAfter: Field, migration: Migration){}
  async renameField(toModel: InitializedModelsType, fromModel: InitializedModelsType, fieldNameBefore: string, fieldNameAfter: string, migration: Migration){}
  async removeField(toModel: InitializedModelsType, fromModel: InitializedModelsType, fieldName: string, migration: Migration){}
  async finish() {}
}
