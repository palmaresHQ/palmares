/* eslint-disable @typescript-eslint/no-unused-vars */
import Engine from '.';
import Migration from '../migrations/migrate/migration';
import EngineFields from './fields';
import { InitializedModelsType } from '../types';
import { Field } from '../models/fields';

/**
 * Engine migrations enables developers to have migrations easily and automatically, no matter the orm they use.
 *
 * The hole idea of this application is to simplify and padronize the database access in our application.
 * So, instead of
 */
export default class EngineMigrations {
  async init(_engine: Engine): Promise<void> {
    return;
  }

  async addModel(_engine: Engine, _toModel: InitializedModelsType, _migration: Migration) {
    return;
  }

  async removeModel(_engine: Engine, _fromModel: InitializedModelsType, _migration: Migration): Promise<void> {
    return;
  }

  async changeModel(
    _engine: Engine,
    _toModel: InitializedModelsType,
    _fromModel: InitializedModelsType,
    _migration: Migration
  ): Promise<void> {
    return;
  }

  async addField(
    _engine: Engine,
    _toModel: InitializedModelsType,
    _fromModel: InitializedModelsType,
    _fieldName: string,
    _migration: Migration
  ): Promise<void> {
    return;
  }

  async changeField(
    _engine: Engine,
    _toModel: InitializedModelsType,
    _fromModel: InitializedModelsType,
    _fieldBefore: Field,
    _fieldAfter: Field,
    _migration: Migration
  ): Promise<void> {
    return;
  }

  async renameField(
    _engine: Engine,
    _toModel: InitializedModelsType,
    _fromModel: InitializedModelsType,
    _fieldNameBefore: string,
    _fieldNameAfter: string,
    _migration: Migration
  ): Promise<void> {
    return;
  }

  async removeField(
    _engine: Engine,
    _toModel: InitializedModelsType,
    _fromModel: InitializedModelsType,
    _fieldName: string,
    _migration: Migration
  ): Promise<void> {
    return;
  }

  async finish(_engine: Engine): Promise<void> {
    return;
  }
}
