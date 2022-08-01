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

  async init(): Promise<void> {
    return;
  }

  async addModel(
    toModel: InitializedModelsType,
    migration: Migration
  ) {
    return;
  }

  async removeModel(
    fromModel: InitializedModelsType,
    migration: Migration
  ): Promise<void> {
    return;
  }

  async changeModel(
    toModel: InitializedModelsType,
    fromModel: InitializedModelsType,
    migration: Migration
  ): Promise<void> {
    return;
  }

  async addField(
    toModel: InitializedModelsType,
    fromModel: InitializedModelsType,
    fieldName: string,
    migration: Migration
  ): Promise<void> {
    return;
  }

  async changeField(
    toModel: InitializedModelsType,
    fromModel: InitializedModelsType,
    fieldBefore: Field,
    fieldAfter: Field,
    migration: Migration
  ): Promise<void> {
    return;
  }

  async renameField(
    toModel: InitializedModelsType,
    fromModel: InitializedModelsType,
    fieldNameBefore: string,
    fieldNameAfter: string,
    migration: Migration
  ): Promise<void> {
    return;
  }

  async removeField(
    toModel: InitializedModelsType,
    fromModel: InitializedModelsType,
    fieldName: string,
    migration: Migration
  ): Promise<void> {
    return;
  }

  async finish(): Promise<void> {
    return;
  }
}
