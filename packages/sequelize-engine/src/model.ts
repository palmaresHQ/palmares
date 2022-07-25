import { models, TModel } from "@palmares/databases";
import { Sequelize, ModelOptions, ModelAttributeColumnOptions, Model, ModelStatic, ModelCtor, OrderItem } from "sequelize";

import SequelizeEngine from "./engine";
import SequelizeEngineFields from "./fields";
import { ModelTranslatorIndexesType } from "./types";

/**
 * This class is used to create a sequelize model from the default model definition.
 */
export default class ModelTranslator {
  engine: SequelizeEngine;
  fields: SequelizeEngineFields;
  sequelize: Sequelize;
  #indexes: ModelTranslatorIndexesType = {};

  constructor(engine: SequelizeEngine<any>, fields: SequelizeEngineFields) {
    this.engine = engine;
    this.fields = fields;
    this.sequelize = engine.instance as Sequelize;
  }

  async #translateOptions(model: TModel): Promise<ModelOptions> {
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

  async #translateOrdering(originalModel: TModel, translatedModel: ModelCtor<Model>) {
    const translatedOrdering: OrderItem[] = (originalModel.options.ordering || [])?.map(order => {
      const orderAsString = order as string;
      const isDescending = orderAsString.startsWith('-');
      return isDescending ? [orderAsString.substring(1), 'DESC'] : [orderAsString, 'ASC'];
    });

    if (translatedOrdering.length > 0) {
      translatedModel.addScope('defaultScope', {
        order: translatedOrdering || []
      }, { override: true });
    }
  }

  async #translateFields(model: TModel) {
    const fieldsEntries = Object.keys(model.fields);
    for (const fieldName of fieldsEntries) {
      const translatedAttributes = await this.fields.getTranslated(fieldName);
      const isTranslatedAttributeDefined = translatedAttributes !== null &&
        typeof translatedAttributes === "object";
      if (isTranslatedAttributeDefined) this.fields.fieldAttributes[fieldName] = translatedAttributes;
    }
    return this.fields.fieldAttributes;
  }

  async translate(model: TModel): Promise<ModelCtor<Model> | undefined> {
    const translatedOptions = await this.#translateOptions(model);
    const translatedAttributes = await this.#translateFields(model);

    translatedOptions.indexes = await this.fields.getIndexes(model.name);

    const translatedModel = this.engine.instance?.define(model.name, translatedAttributes, translatedOptions);

    if (translatedModel !== undefined) await this.#translateOrdering(model, translatedModel);
    return translatedModel;
  }
}
