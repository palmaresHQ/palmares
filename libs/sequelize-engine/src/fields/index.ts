import { EngineAutoFieldParser, EngineFields, Field, models } from '@palmares/databases';

import {
  ModelAttributeColumnOptions,
  Model,
  ModelCtor,
  HasManyOptions,
  BelongsToOptions,
  HasOneOptions,
  ForeignKeyOptions,
  IndexesOptions,
} from 'sequelize';

import type SequelizeEngine from '../engine';
import { PreventForeignKeyError } from '../exceptions';
import { ModelTranslatorIndexesType, RelatedModelToEvaluateAfterType } from '../types';
import SequelizeEngineFieldParser from './field';
import SequelizeEngineAutoFieldParser from './auto';
import SequelizeEngineBigAutoFieldParser from './big-auto';
import SequelizeEngineBigIntegerFieldParser from './big-integer';
import SequelizeEngineCharFieldParser from './char';
import SequelizeEngineDateFieldParser from './date';
import SequelizeEngineDecimalFieldParser from './decimal';
import SequelizeEngineTextFieldParser from './text';
import SequelizeEngineUuidFieldParser from './uuid';
import SequelizeEngineForeignKeyFieldParser from './foreign-key';
import SequelizeEngineIntegerFieldParser from './integer';
import SequelizeEngineEnumFieldParser from './enum';
import SequelizeEngineBooleanFieldParser from './boolean';

/**
 * This class is used to translate the fields of a model to the attributes of a sequelize model.
 * This is closely tied to the engine itself because sometimes we might need the models after it was translated
 * or sometimes we need to translate stuff outside of the fields for example the indexes that are from the model
 * itself.
 */
export default class SequelizeEngineFields extends EngineFields {
  declare fieldsParser: SequelizeEngineFieldParser;
  autoFieldParser = new SequelizeEngineAutoFieldParser();
  bigAutoFieldParser = new SequelizeEngineBigAutoFieldParser();
  bigIntegerFieldParser = new SequelizeEngineBigIntegerFieldParser();
  charFieldParser = new SequelizeEngineCharFieldParser();
  dateFieldParser = new SequelizeEngineDateFieldParser();
  decimalFieldParser = new SequelizeEngineDecimalFieldParser();
  foreignKeyFieldParser = new SequelizeEngineForeignKeyFieldParser();
  integerFieldParser = new SequelizeEngineIntegerFieldParser();
  textFieldParser = new SequelizeEngineTextFieldParser();
  uuidFieldParser = new SequelizeEngineUuidFieldParser();
  enumFieldParser = new SequelizeEngineEnumFieldParser();
  booleanFieldParser = new SequelizeEngineBooleanFieldParser();

  engineInstance!: SequelizeEngine;
  #dateFieldsAsAutoNowToAddHooks = new Map<string, string[]>();
  #indexes: ModelTranslatorIndexesType = {};
  #relatedFieldsToEvaluate: RelatedModelToEvaluateAfterType = {};
  #onDeleteOperations = {
    [models.fields.ON_DELETE.CASCADE]: 'CASCADE',
    [models.fields.ON_DELETE.SET_NULL]: 'SET NULL',
    [models.fields.ON_DELETE.SET_DEFAULT]: 'SET DEFAULT',
    [models.fields.ON_DELETE.RESTRICT]: 'RESTRICT',
    [models.fields.ON_DELETE.DO_NOTHING]: 'DO NOTHING',
  };

  constructor() {
    super(new SequelizeEngineFieldParser());
    this.fieldsParser.auto = this.autoFieldParser;
    this.fieldsParser.bigAuto = this.bigAutoFieldParser;
    this.fieldsParser.bigInt = this.bigIntegerFieldParser;
    this.fieldsParser.char = this.charFieldParser;
    this.fieldsParser.date = this.dateFieldParser;
    this.fieldsParser.decimal = this.decimalFieldParser;
    this.fieldsParser.foreignKey = this.foreignKeyFieldParser;
    this.fieldsParser.integer = this.integerFieldParser;
    this.fieldsParser.text = this.textFieldParser;
    this.fieldsParser.uuid = this.uuidFieldParser;
    this.fieldsParser.enum = this.enumFieldParser;
    this.fieldsParser.boolean = this.booleanFieldParser;
  }

  /**
   * Used for appending the hook to the model to update the date of the date field with the current date.
   *
   * This is set when `autoNow` is set to true in the DateField or DatetimeField.
   *
   * Reference on hooks: https://sequelize.org/docs/v6/other-topics/hooks/
   *
   * @param modelName - The name of the model that the field belongs to.
   * @param fieldName - The name of the field that is being updated.
   */
  async addHooksToUpdateDateFields(modelName: string, fieldName: string) {
    if (this.#dateFieldsAsAutoNowToAddHooks.has(modelName)) {
      this.#dateFieldsAsAutoNowToAddHooks.get(modelName)?.push(fieldName);
    } else {
      this.#dateFieldsAsAutoNowToAddHooks.set(modelName, [fieldName]);
    }
  }

  /**
   * Append the field to an array so we can evaluate this later after the model is defined.
   *
   * We append to the relatedTo model. So for example, we have User and we have Post. If Post is defined
   * first an user is not defined, it's just after User is defined. That we will add the related field of
   * 'Post' model to it. The problem, is: sometimes the otherway can occur: We have defined User already, but
   * we need to wait until `Post` is defined to assign the related value, on this case the relatedTo will finish
   */
  async addRelatedFieldToEvaluateAfter(
    engine: SequelizeEngine,
    field: models.fields.ForeignKeyField,
    fieldAttributes: ModelAttributeColumnOptions
  ) {
    const isModelAlreadyInitialized = engine.initializedModels[field.relatedTo] !== undefined;
    const modelNameToHandleRelation = isModelAlreadyInitialized ? field.model.name : field.relatedTo;
    const isModelAlreadyInObject = this.#relatedFieldsToEvaluate[modelNameToHandleRelation] !== undefined;
    if (isModelAlreadyInObject === false) this.#relatedFieldsToEvaluate[modelNameToHandleRelation] = [];
    this.#relatedFieldsToEvaluate[modelNameToHandleRelation].push({
      field: field,
      fieldAttributes: fieldAttributes,
    });
  }

  /**
   * Append the index to add it later to the model options.
   *
   * @param field - The field to add the index to.
   */
  async appendIndexes(field: models.fields.Field) {
    const index = {
      unique: (field.unique as boolean) === true,
      fields: [field.databaseName],
    };
    const doesFieldIndexForModelNameExists = Array.isArray(this.#indexes[field.model.name]);
    if (doesFieldIndexForModelNameExists) {
      this.#indexes[field.model.name].push(index);
    } else {
      this.#indexes[field.model.name] = [index];
    }
  }

  /**
   * Function supposed to be called after the model was created in sequelize. This way we can add
   * the hooks to update the date fields with `autoNow` set to true and handle the related fields
   * that are defined in the model.
   *
   * @param modelName - The name of the model that was created so we can fetch it on the `#initializedModels`
   * object.
   */
  async afterModelCreation(engine: SequelizeEngine, modelName: string) {
    await Promise.all([
      this.#handleHooksToUpdateDateFieldsAfterModelCreation(engine, modelName),
      this.#handleRelatedFieldsAfterModelCreation(engine, modelName),
    ]);
  }

  async #handleHooksToUpdateDateFieldsAfterModelCreation(engine: SequelizeEngine, modelName: string) {
    const hasDateFieldToUpdateForModelName = this.#dateFieldsAsAutoNowToAddHooks.has(modelName);
    if (hasDateFieldToUpdateForModelName) {
      const modelToAddHook: ModelCtor<Model> = engine.initializedModels[modelName] as ModelCtor<Model>;
      const dateFieldsToUpdate = this.#dateFieldsAsAutoNowToAddHooks.get(modelName) as string[];
      modelToAddHook.beforeSave((instance: Model) => {
        for (const updateDateHook of dateFieldsToUpdate) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          instance[updateDateHook] = new Date();
        }
      });
    }
  }

  async #handleRelatedFieldsAfterModelCreation(engine: SequelizeEngine, modelName: string) {
    const hasRelatedFieldsToEvaluateForModelName = Array.isArray(this.#relatedFieldsToEvaluate[modelName]);
    if (hasRelatedFieldsToEvaluateForModelName) {
      this.#relatedFieldsToEvaluate[modelName] = await Promise.all(
        this.#relatedFieldsToEvaluate[modelName].filter(
          async ({ field, fieldAttributes }) => await this.#handleRelatedField(engine, field, fieldAttributes)
        )
      );
    }
  }

  async #handleRelatedField(
    engine: SequelizeEngine,
    field: models.fields.ForeignKeyField,
    fieldAttributes: ModelAttributeColumnOptions & ForeignKeyOptions
  ) {
    const modelWithForeignKeyField: ModelCtor<Model> = engine.initializedModels[field.model.name] as ModelCtor<Model>;
    const relatedToModel: ModelCtor<Model> = engine.initializedModels[field.relatedTo] as ModelCtor<Model>;
    const isRelatedModelAndModelOfForeignDefined =
      relatedToModel !== undefined && modelWithForeignKeyField !== undefined;

    if (isRelatedModelAndModelOfForeignDefined) {
      const translatedOnDelete: string = this.#onDeleteOperations[field.onDelete];

      fieldAttributes.name = field.fieldName;
      const relationOptions: HasManyOptions | BelongsToOptions | HasOneOptions = {
        foreignKey: fieldAttributes,
        hooks: true,
        onDelete: translatedOnDelete,
        sourceKey: field.toField,
      };
      switch (field.typeName) {
        case models.fields.ForeignKeyField.name:
          relationOptions.as = field.relatedName as string;
          relatedToModel.hasMany(modelWithForeignKeyField, relationOptions);

          relationOptions.as = field.relationName as string;
          modelWithForeignKeyField.belongsTo(relatedToModel, relationOptions);
          return false;
      }
    }
    return true;
  }

  async handleDefaultAttributes(
    modelAttributes: ModelAttributeColumnOptions,
    field: models.fields.Field
  ): Promise<void> {
    const isFieldAIndexOrIsFieldUnique = field.dbIndex === true || (field.unique as boolean) === true;
    if (isFieldAIndexOrIsFieldUnique) await this.appendIndexes(field);
    if (modelAttributes.defaultValue === undefined) modelAttributes.defaultValue = field.defaultValue;
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

  async getIndexes(modelName: string): Promise<IndexesOptions[]> {
    const doesIndexesExistForModel = Array.isArray(this.#indexes[modelName]);
    if (doesIndexesExistForModel) return this.#indexes[modelName];
    return [];
  }

  async get(
    _: SequelizeEngine,
    field: Field,
    defaultGetCallback: (field: Field) => Promise<any>
  ): Promise<ModelAttributeColumnOptions | null> {
    try {
      return await defaultGetCallback(field);
    } catch (e) {
      const error = e as Error;
      switch (error.name) {
        case PreventForeignKeyError.name:
          return null;
        default:
          throw error;
      }
    }
  }
}
