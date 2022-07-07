import Engine from ".";
import { Model } from "../models";
import Migration from "../models/migrations/migration";
import EngineFields from "./fields";

export default class EngineMigrations {
  engine!: Engine;
  engineFields!: EngineFields;

  constructor(engine: Engine, engineFields: EngineFields) {
    this.engine = engine;
    this.engineFields = engineFields;
  }

  async init() {}
  async addModel(toModel: Model, migration: Migration) {}
  async removeModel(fromModel: Model, migration: Migration){}
  async changeModel(toModel: Model, fromModel: Model, migration: Migration){}
  async finish() {}
}
