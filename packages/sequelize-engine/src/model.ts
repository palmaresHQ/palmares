import { models, ModelOptionsType } from "@palmares/core";
import SequelizeEngine from "./engine";
import SequelizeEngineFields from "./fields";

export default class ModelTranslator {
  engine: SequelizeEngine;
  fields: SequelizeEngineFields;

  constructor(engine: SequelizeEngine, fields: SequelizeEngineFields) {
    this.engine = engine;
    this.fields = fields;
  }

  async #translateOptions(modelName: string, options: ModelOptionsType)  {

  }

  async translate(modelName: string, model: models.Model) {

  }
}