import { EngineFields, models } from '@palmares/databases';

import {
  DataTypes,
  ModelAttributeColumnOptions,
  Model,
  ModelCtor,
  HasManyOptions,
  BelongsToOptions,
  HasOneOptions,
  ForeignKeyOptions,
  IndexesOptions,
} from 'sequelize';

import SequelizeEngine from './engine';
import {
  UnsupportedFieldTypeError,
  PreventForeignKeyError,
} from './exceptions';
import {
  ModelTranslatorIndexesType,
  RelatedModelToEvaluateAfterType,
} from './types';

/**
 * This class is used to translate the fields of a model to the attributes of a sequelize model.
 * This is closely tied to the engine itself because sometimes we might need the models after it was translated
 * or sometimes we need to translate stuff outside of the fields for example the indexes that are from the model
 * itself.
 */
export default class SequelizeEngineFields extends EngineFields {
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

  constructor(engineInstance: SequelizeEngine<any>) {
    super(engineInstance);
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
  async #addHooksToUpdateDateFields(modelName: string, fieldName: string) {
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
  async #addRelatedFieldToEvaluateAfter(
    field: models.fields.ForeignKeyField,
    fieldAttributes: ModelAttributeColumnOptions
  ) {
    const isModelAlreadyInitialized =
      this.engineInstance.initializedModels[field.relatedTo] !== undefined;
    const modelNameToHandleRelation = isModelAlreadyInitialized
      ? field.model.name
      : field.relatedTo;
    const isModelAlreadyInObject =
      this.#relatedFieldsToEvaluate[modelNameToHandleRelation] !== undefined;
    if (isModelAlreadyInObject === false)
      this.#relatedFieldsToEvaluate[modelNameToHandleRelation] = [];
    this.#relatedFieldsToEvaluate[modelNameToHandleRelation].push({
      field: field,
      fieldAttributes: fieldAttributes,
    });
    throw new PreventForeignKeyError();
  }

  /**
   * Append the index to add it later to the model options.
   *
   * @param field - The field to add the index to.
   */
  async #appendIndexes(field: models.fields.Field) {
    const index = {
      unique: (field.unique as boolean) === true,
      fields: [field.databaseName],
    };
    const doesFieldIndexForModelNameExists = Array.isArray(
      this.#indexes[field.model.name]
    );
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
  async afterModelCreation(modelName: string) {
    await Promise.all([
      this.#handleHooksToUpdateDateFieldsAfterModelCreation(modelName),
      this.#handleRelatedFieldsAfterModelCreation(modelName),
    ]);
  }

  async #handleHooksToUpdateDateFieldsAfterModelCreation(modelName: string) {
    const hasDateFieldToUpdateForModelName =
      this.#dateFieldsAsAutoNowToAddHooks.has(modelName);
    if (hasDateFieldToUpdateForModelName) {
      const modelToAddHook: ModelCtor<Model> = this.engineInstance
        .initializedModels[modelName] as ModelCtor<Model>;
      const dateFieldsToUpdate = this.#dateFieldsAsAutoNowToAddHooks.get(
        modelName
      ) as string[];
      modelToAddHook.beforeSave((instance: Model) => {
        for (const updateDateHook of dateFieldsToUpdate) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          instance[updateDateHook] = new Date();
        }
      });
    }
  }

  async #handleRelatedFieldsAfterModelCreation(modelName: string) {
    const hasRelatedFieldsToEvaluateForModelName = Array.isArray(
      this.#relatedFieldsToEvaluate[modelName]
    );

    if (hasRelatedFieldsToEvaluateForModelName) {
      this.#relatedFieldsToEvaluate[modelName] = await Promise.all(
        this.#relatedFieldsToEvaluate[modelName].filter(
          async ({ field, fieldAttributes }) =>
            await this.#handleRelatedField(field, fieldAttributes)
        )
      );
    }
  }

  async #handleRelatedField(
    field: models.fields.ForeignKeyField,
    fieldAttributes: ModelAttributeColumnOptions & ForeignKeyOptions
  ) {
    const modelWithForeignKeyField: ModelCtor<Model> = this.engineInstance
      .initializedModels[field.model.name] as ModelCtor<Model>;
    const relatedToModel: ModelCtor<Model> = this.engineInstance
      .initializedModels[field.relatedTo] as ModelCtor<Model>;
    const isRelatedModelAndModelOfForeignDefined =
      relatedToModel !== undefined && modelWithForeignKeyField !== undefined;

    if (isRelatedModelAndModelOfForeignDefined) {
      const translatedOnDelete: string =
        this.#onDeleteOperations[field.onDelete];

      fieldAttributes.name = field.fieldName;
      const relationOptions: HasManyOptions | BelongsToOptions | HasOneOptions =
        {
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
    const isFieldAIndexOrIsFieldUnique =
      field.dbIndex === true || (field.unique as boolean) === true;
    if (isFieldAIndexOrIsFieldUnique) await this.#appendIndexes(field);
    if (modelAttributes.defaultValue === undefined)
      modelAttributes.defaultValue = field.defaultValue;
    modelAttributes.primaryKey = field.primaryKey;
    modelAttributes.allowNull = field.allowNull;
    modelAttributes.unique = field.unique;
    modelAttributes.validate = { notNull: !field.allowNull };
    modelAttributes.field = field.databaseName as string;

    const customAttributesEntries = Object.entries(field.customAttributes);
    for (const [key, value] of customAttributesEntries) {
      const keyAsTypeofModelColumnOption =
        key as keyof ModelAttributeColumnOptions;
      modelAttributes[keyAsTypeofModelColumnOption] = value as never;
    }
  }

  async #handleTextFieldValidations(
    field: models.fields.TextField,
    fieldAttributes: ModelAttributeColumnOptions
  ) {
    if (field.allowBlank === false)
      fieldAttributes.validate = {
        ...fieldAttributes.validate,
        notEmpty: !field.allowBlank,
      };
  }

  async #translateTextField(
    field: models.fields.TextField,
    fieldAttributes: ModelAttributeColumnOptions
  ) {
    fieldAttributes.type = DataTypes.STRING;
    await this.#handleTextFieldValidations(field, fieldAttributes);
  }

  async #translateCharField(
    field: models.fields.CharField,
    fieldAttributes: ModelAttributeColumnOptions
  ): Promise<void> {
    fieldAttributes.type = DataTypes.STRING(field.maxLength);
    await this.#handleTextFieldValidations(field, fieldAttributes);
  }

  async #translateUUIDField(
    field: models.fields.UUIDField,
    fieldAttributes: ModelAttributeColumnOptions
  ): Promise<void> {
    fieldAttributes.type = DataTypes.UUID;
    if ((field.autoGenerate as boolean) === true)
      fieldAttributes.defaultValue = DataTypes.UUIDV4;
    fieldAttributes.validate = {
      ...fieldAttributes.validate,
      isUUID: 4,
    };
    await this.#handleTextFieldValidations(field, fieldAttributes);
  }

  async #translateDateField(
    field: models.fields.DateField,
    fieldAttributes: ModelAttributeColumnOptions
  ): Promise<void> {
    fieldAttributes.type = DataTypes.DATEONLY;
    const isAutoNow = (field.autoNow as boolean) === true;
    const hasAutoNowOrAutoNowAdd =
      (field.autoNowAdd as boolean) === true || isAutoNow;
    if (hasAutoNowOrAutoNowAdd) fieldAttributes.defaultValue = DataTypes.NOW;
    if (isAutoNow)
      await this.#addHooksToUpdateDateFields(field.model.name, field.fieldName);
  }

  async #translateAutoField(
    field: models.fields.AutoField,
    fieldAttributes: ModelAttributeColumnOptions
  ) {
    fieldAttributes.autoIncrement = true;
    fieldAttributes.autoIncrementIdentity = true;
    fieldAttributes.type = DataTypes.INTEGER;
    fieldAttributes.validate = {
      ...fieldAttributes.validate,
      isNumeric: true,
      isInt: true,
    };
  }

  async #translateBigAutoField(
    field: models.fields.BigAutoField,
    fieldAttributes: ModelAttributeColumnOptions
  ) {
    fieldAttributes.autoIncrement = true;
    fieldAttributes.autoIncrementIdentity = true;
    fieldAttributes.type = DataTypes.BIGINT;
    fieldAttributes.validate = {
      ...fieldAttributes.validate,
      isNumeric: true,
      isInt: true,
    };
  }

  async #translateIntegerField(
    field: models.fields.IntegerField,
    fieldAttributes: ModelAttributeColumnOptions
  ) {
    fieldAttributes.type = DataTypes.INTEGER;
    fieldAttributes.validate = {
      ...fieldAttributes.validate,
      isNumeric: true,
      isInt: true,
    };
  }

  async #translateForeignKeyField(
    field: models.fields.ForeignKeyField,
    fieldAttributes: ModelAttributeColumnOptions
  ): Promise<void> {
    await this.#addRelatedFieldToEvaluateAfter(field, fieldAttributes);
  }

  async #translateFieldType(
    fieldAttributes: ModelAttributeColumnOptions,
    field: models.fields.Field
  ): Promise<void> {
    // Yes we can definitely simplify it by not making the translate functions private
    // but the problem is that this will make it harder to read and know what types of fields
    // are supported by the engine.
    switch (field.typeName) {
      case models.fields.CharField.name:
        return await this.#translateCharField(
          field as models.fields.CharField,
          fieldAttributes
        );
      case models.fields.TextField.name:
        return await this.#translateTextField(
          field as models.fields.TextField,
          fieldAttributes
        );
      case models.fields.UUIDField.name:
        return await this.#translateUUIDField(
          field as models.fields.UUIDField,
          fieldAttributes
        );
      case models.fields.DateField.name:
        return await this.#translateDateField(
          field as models.fields.DateField,
          fieldAttributes
        );
      case models.fields.AutoField.name:
        return await this.#translateAutoField(
          field as models.fields.AutoField<any, any, any, any, any>,
          fieldAttributes
        );
      case models.fields.BigAutoField.name:
        return await this.#translateBigAutoField(
          field as models.fields.BigAutoField<any, any, any, any, any>,
          fieldAttributes
        );
      case models.fields.IntegerField.name:
        return await this.#translateIntegerField(
          field as models.fields.IntegerField,
          fieldAttributes
        );
      case models.fields.ForeignKeyField.name:
        return await this.#translateForeignKeyField(
          field as models.fields.ForeignKeyField,
          fieldAttributes
        );
      default:
        throw new UnsupportedFieldTypeError(field.constructor.name);
    }
  }

  async #translateField(
    field: models.fields.Field
  ): Promise<ModelAttributeColumnOptions> {
    const fieldAttributes = {} as ModelAttributeColumnOptions;
    await this.handleDefaultAttributes(fieldAttributes, field);
    await this.#translateFieldType(fieldAttributes, field);
    return fieldAttributes;
  }

  async getIndexes(modelName: string): Promise<IndexesOptions[]> {
    const doesIndexesExistForModel = Array.isArray(this.#indexes[modelName]);
    if (doesIndexesExistForModel) return this.#indexes[modelName];
    return [];
  }

  async getTranslated(
    fieldName: string
  ): Promise<ModelAttributeColumnOptions | null> {
    const { value, wasTranslated } = await super.get(fieldName);
    if (!wasTranslated) {
      const field = this.fields.get(fieldName) as models.fields.Field;
      try {
        const attributes = await this.#translateField(field);
        return attributes;
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
    return value as ModelAttributeColumnOptions | null;
  }
}
