import { EngineFields, models, } from "@palmares/core";
import { DataTypes, ModelAttributeColumnOptions, ModelAttributes } from "sequelize";

import SequelizeEngine from "./engine";
import { ModelTranslatorIndexesType } from "./types";

export default class SequelizeEngineFields extends EngineFields {
  engineInstance!: SequelizeEngine;
  dateFieldsAsAutoNowToAddHooks = new Map<string, string[]>()
  #indexes: ModelTranslatorIndexesType = {};

  constructor(engineInstance: SequelizeEngine) {
    super(engineInstance);
  }

  async #addHooksToUpdateDateFields(modelName: string, fieldName: string) {
    if (this.dateFieldsAsAutoNowToAddHooks.has(modelName)) {
      this.dateFieldsAsAutoNowToAddHooks.get(modelName)?.push(fieldName);
    } else {
      this.dateFieldsAsAutoNowToAddHooks.set(modelName, [fieldName]);
    }
  }

  /** 
   * Retrieves the sequelize ModelAttributes for a given date field type. 
   * For dates we have two possible dates: created_at and updated_at. The Created_at is created
   * with the autoNowAdd as set to `true`. This means that we will only add this date once.
   * The `autoNow` is for the updated_at date. This means that we will add this date every time
   * the data is updated. In order for this to work we need to create a hook that will update the date
   * on every update on the model.
   * 
   * Reference: https://sequelize.org/docs/v7/other-topics/hooks/
   * 
   * @param modelAttributes - The sequelize ModelAttributes object that we are constructing.
   * @param field - The field that we are currently processing.
   */
  async #handleAutoDate(
    modelAttributes: ModelAttributeColumnOptions, 
    field: models.fields.Field
  ) {
    const isAutoNow = field.autoNow === true;
    const hasAutoNowOrAutoNowAdd = field.autoNowAdd === true || isAutoNow;
    if (hasAutoNowOrAutoNowAdd) modelAttributes.defaultValue = DataTypes.NOW;
    if (isAutoNow) await this.#addHooksToUpdateDateFields(field.model.name, field.fieldName);
  }

  async #appendIndexes(field: models.fields.Field) {
    const index = {
      unique: field.unique === true,
      fields: [field.fieldName]
    }
    const doesFieldIndexForModelNameExists = Array.isArray(this.#indexes[field.model.name]);
    if (doesFieldIndexForModelNameExists) {
      this.#indexes[field.model.name].push(index);
    } else {
      this.#indexes[field.model.name] = [index];
    }
  }

  async #handleDefaultAttributes(
    modelAttributes: ModelAttributeColumnOptions, 
    field: models.fields.Field
  ): Promise<void> {
    const isFieldAIndexOrIsFieldUnique = field.dbIndex === true || field.unique === true;
    if (isFieldAIndexOrIsFieldUnique) this.#appendIndexes(field);
    if (modelAttributes.defaultValue === undefined) 
      modelAttributes.defaultValue = field.defaultValue;
    
    modelAttributes.primaryKey = field.primaryKey;
    modelAttributes.allowNull = field.allowNull;
    modelAttributes.unique = field.unique;
    modelAttributes.validate = { notNull: !field.allowNull };
    modelAttributes.field = field.databaseName as string;
    
    const customAttributesEntries = Object.entries(field.customAttributes);
    for (const [key, value] of customAttributesEntries) {
      const keyAsTypeofModelColumnOption = key as keyof ModelAttributeColumnOptions;
      modelAttributes[keyAsTypeofModelColumnOption] = value as never;
    }
  }
  
  async #translateFieldType(
    fieldAttributes: ModelAttributeColumnOptions,
    field: models.fields.Field, 
    fieldType: string, 
  ): Promise<void> {
    switch (fieldType) {
      case 'BooleanField':
        return await this.#translateBooleanField(field, fieldAttributes);
      case 'CharField':
        return await this.#translateCharField(field, fieldAttributes);
      case 'TextField':
        return await this.#translateTextField(field, fieldAttributes);
      case 'DateField':
        return await this.#translateDateField(field, fieldAttributes);
      case 'DecimalField':
        return await this.#translateDecimalField(field, fieldAttributes);
      case 'IntegerField':
        return await this.#translateIntegerField(field, fieldAttributes);
      case 'BigIntegerField':
        return await this.#translateBigIntegerField(field, fieldAttributes);
      case 'AutoField':
        return await this.#translateAutoField(field, fieldAttributes);
      case 'BigAutoField':
        return await this.#translateAutoBigIntegerField(field, fieldAttributes);
      case 'ForeignKeyField':
        return await this.#translateForeignKeyField(field, fieldAttributes);
    }
  }

  async #translateField(field: models.fields.Field) {
    const fieldType = field.constructor.name;
    let fieldAttributes = {} as ModelAttributeColumnOptions;
    await this.#handleAutoDate(fieldAttributes, field);
    await this.#handleDefaultAttributes(fieldAttributes, field);
    await this.#translateFieldType(fieldAttributes, field, fieldType);
  }

  async get(fieldName: string): Promise<ModelAttributes | null> {
    const field = this.fields.get(fieldName) as models.fields.Field;
    const attributes = await this.#translateField(field);

    return null
  }
}