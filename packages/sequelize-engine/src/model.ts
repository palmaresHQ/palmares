import { models, ModelOptionsType } from "@palmares/core";
import { Sequelize, ModelOptions, ModelAttributes } from "sequelize";

import SequelizeEngine from "./engine";
import SequelizeEngineFields from "./fields";
import { ModelTranslatorIndexesType } from "./types";

export default class ModelTranslator {
  engine: SequelizeEngine;
  fields: SequelizeEngineFields;
  sequelize: Sequelize;
  #indexes: ModelTranslatorIndexesType = {};

  constructor(engine: SequelizeEngine, fields: SequelizeEngineFields) {
    this.engine = engine;
    this.fields = fields;
    this.sequelize = engine.sequelizeInstance as Sequelize;
  }

  async #translateOptions(model: models.Model): Promise<ModelOptions> {
    const modelName = model.name;
    const options = model.options;
    const indexes = this.#indexes[modelName] ? this.#indexes[modelName] : [];
    return {
      underscored: options.underscored,
      indexes: indexes,
      timestamps: false,
      tableName: options.tableName,
      ...options.customOptions
    };
  }

  async #translateFields(model: models.Model) {
    let translatedFields: { [key: string]: ModelAttributes | null } = {};
    const fieldsEntries = Object.keys(model.fields);
    for (const fieldName of fieldsEntries) {
      translatedFields[fieldName] = await this.fields.get(fieldName);
    }
    return translatedFields;
  }

  async translate(model: models.Model) {
    const translatedOptions = await this.#translateOptions(model);
    const translatedAttributes = await this.#translateFields(model);
    return null;
  }
}