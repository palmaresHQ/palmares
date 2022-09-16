import { Database, ModelFields, models } from '@palmares/databases';

import { Field, NumberField, StringField } from '../fields';
import Serializer from '.';
import type {
  SerializerType,
  SerializerFieldsType,
  ModelSerializerOptions,
  ModelSerializerParamsType,
  ModelSerializerOutType,
  ModelSerializerInType,
  ModelSerializerParamsTypeForConstructor,
} from './types';
import type { This } from '../types';
import type { FieldType } from '../fields/types';
import {
  InvalidModelOnModelSerializerError,
  NoRelatedModelFoundForRelatedFieldError,
} from '../exceptions';

/**
 * This is used to convert a Palmares model to a serializer so you don't need to repeat the same fields of your model again.
 * Everything here, as in the other fields/serializer is dynamically typed so we just guarantee to you that stuff will work as
 * expected even though you will not write any type directly.
 *
 * The hole idea here is to make your code more DRY and less error prone. The model is always obligatory here.
 */
export default class ModelSerializer<
  I extends ModelSerializer = any,
  M extends boolean = boolean,
  C = any,
  D extends SerializerType<I> | undefined = undefined,
  N extends boolean = boolean,
  R extends boolean = boolean,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  DR extends boolean = boolean, // Dynamic Representation (we will fetch the data from the nested serializer automatically)
  MO extends ReturnType<typeof models.Model> = ReturnType<typeof models.Model>,
  IN extends keyof ModelFields<InstanceType<MO>> = any, // Includes (fields from the model in the model serializer representation)
  EX extends keyof ModelFields<InstanceType<MO>> = any, // Excludes (fields from the model that should not be inside the model serializer representation)
  IR extends boolean = DR extends true ? false : R // IsRequired (because of dynamic representation, the required fields will not be required ONLY WHEN REPRESENTING the data)
> extends Serializer<I, M, C, D, N, R, RO, WO, DR, IR> {
  type!: FieldType<SerializerType<I>, N, R, D> &
    Pick<
      ModelFields<InstanceType<MO>>,
      Exclude<keyof InstanceType<MO>['fields'], EX>
    > &
    Pick<ModelFields<InstanceType<MO>>, IN>;
  inType!: M extends true
    ? ModelSerializerInType<I, D, N, R, RO, MO, IN, EX>[]
    : ModelSerializerInType<I, D, N, R, RO, MO, IN, EX>;
  outType!: M extends true
    ? ModelSerializerOutType<I, D, N, IR, WO, MO, IN, EX>[]
    : ModelSerializerOutType<I, D, N, IR, WO, MO, IN, EX>;
  #serializerFieldByModelField: {
    [fieldName: string]: typeof StringField | typeof NumberField;
  } = {
    [models.fields.AutoField.name]: NumberField,
    [models.fields.BigAutoField.name]: NumberField,
    [models.fields.BigIntegerField.name]: NumberField,
    [models.fields.DecimalField.name]: NumberField,
    [models.fields.IntegerField.name]: NumberField,
    [models.fields.CharField.name]: StringField,
    [models.fields.TextField.name]: StringField,
    [models.fields.UUIDField.name]: StringField,
  };

  isDynamicRepresentation = false as DR;
  engineName?: string;
  fields = {} as SerializerFieldsType;
  options = {} as ModelSerializerOptions<MO>;
  static _modelInstance: InstanceType<ReturnType<typeof models.Model>>;
  static _foreignKeyFieldsOfModel: {
    [fieldName: string]: models.fields.ForeignKeyField;
  } = {};
  static _foreignKeyFieldsOfOtherModelsRelatedToModel: {
    [fieldName: string]: models.fields.ForeignKeyField;
  } = {};

  constructor(
    params: ModelSerializerParamsTypeForConstructor<
      I,
      M,
      C,
      N,
      R,
      RO,
      WO,
      DR,
      MO,
      IN,
      EX
    > = {}
  ) {
    super(params);
    this.isDynamicRepresentation = params.isDynamicRepresentation as DR;
    this.engineName = params.engineName;
  }

  static new<
    I extends This<typeof Serializer>,
    M extends boolean = false,
    C = any,
    D extends SerializerType<InstanceType<I>> | undefined = undefined,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = false,
    WO extends boolean = false,
    DR extends boolean = false
  >(
    this: I,
    params: ModelSerializerParamsType<
      InstanceType<I>,
      M extends boolean ? M : boolean,
      C,
      D,
      N,
      R,
      RO,
      WO,
      DR,
      InstanceType<I>['options']['model'],
      InstanceType<I>['options']['fields'][number],
      InstanceType<I>['options']['excludes'][number]
    > = {}
  ) {
    const instance = new this(params) as ModelSerializer<
      InstanceType<I>,
      M,
      C,
      D,
      N,
      R,
      RO,
      WO,
      DR,
      InstanceType<I>['options']['model'],
      InstanceType<I>['options']['fields'][number],
      InstanceType<I>['options']['excludes'][number]
    >;
    const isModelNotDefined =
      instance.options.model.prototype instanceof models.BaseModel === false;
    if (isModelNotDefined)
      throw new InvalidModelOnModelSerializerError(
        this.constructor.name,
        instance.options.model
      );
    return instance;
  }

  async #appendForeignKeyFieldsOfModel(
    fieldName: string,
    field: models.fields.ForeignKeyField
  ) {
    const constructorAsSerializer = this.constructor as typeof ModelSerializer;
    if (constructorAsSerializer._foreignKeyFieldsOfModel[fieldName]) return;
    constructorAsSerializer._foreignKeyFieldsOfModel[fieldName] = field;
  }

  async #appendForeignKeyFieldsOfOtherModelsRelatedToModel(
    fieldName: string,
    field: models.fields.ForeignKeyField
  ) {
    const constructorAsSerializer = this.constructor as typeof ModelSerializer;
    constructorAsSerializer._foreignKeyFieldsOfOtherModelsRelatedToModel[
      fieldName
    ] = field;
  }

  /**
   * This is responsible for retrieving the actual field type if the field is a related field. Since we can be related to a uuid
   * instead of an integer and so on we need to retrieve the actual field type that this field needs to be.
   * If this field is related to a uuid don't you agree that the type of the field should be an StringField
   * instead of a NumberField? That's exactly what this does.
   *
   * IMPORTANT: We will always try to look for `dependsOn` option before looking in the models initialized by the database.
   * Sometimes you won't want to initialize the database (like on monorepo setups or even a REPL setup) just for this,
   * so for that use cases we recommend that you always use the `dependsOn` option.
   *
   * @param database - The database instance from @palmares/databases
   * @param model - The model instance from the model serializer.
   * @param field - The field instance that should be a ForeignKeyField or could also be a OneToOneField.
   * @returns - Returns the field type.
   */
  async #getRelatedField(
    database: Database,
    model: InstanceType<ReturnType<typeof models.Model>>,
    field: models.fields.ForeignKeyField
  ) {
    if (field instanceof models.fields.ForeignKeyField) {
      let foundRelatedField: models.fields.ForeignKeyField | undefined =
        undefined;
      const isARecursiveRelation = model.constructor.name === field.relatedTo;
      if (isARecursiveRelation) {
        if (model.fields[field.toField])
          foundRelatedField = model.fields[
            field.toField
          ] as models.fields.ForeignKeyField;
      }

      if (foundRelatedField === undefined) {
        for (const dependentModel of this.options?.dependsOn || []) {
          const isTheDependentModelTheOneRelatedToTheField =
            dependentModel.name === field.relatedTo;
          if (isTheDependentModelTheOneRelatedToTheField) {
            const relatedModelInstance = new this.options.model();
            await relatedModelInstance.initializeBasic();
            if (relatedModelInstance.fields[field.toField]) {
              foundRelatedField = relatedModelInstance.fields[
                field.toField
              ] as models.fields.ForeignKeyField;
            }
          }
        }
      }

      if (foundRelatedField === undefined) {
        const modelsInApplication = await database.getModels();
        const modelInApplication = modelsInApplication[field.relatedTo];
        if (modelInApplication) {
          const relatedModelInstance = new modelInApplication.model();
          await relatedModelInstance.initializeBasic();
          if (relatedModelInstance.fields[field.toField]) {
            foundRelatedField = relatedModelInstance.fields[
              field.toField
            ] as models.fields.ForeignKeyField;
          }
        }
      }

      if (foundRelatedField === undefined)
        throw new NoRelatedModelFoundForRelatedFieldError(field.fieldName);
      else {
        await this.#appendForeignKeyFieldsOfOtherModelsRelatedToModel(
          foundRelatedField.fieldName as string,
          foundRelatedField
        );
        return foundRelatedField;
      }
    }
    return field;
  }

  /**
   * If the user define a field with the relatedName or a relationName we retrieve the values of this field dynamically.
   *
   * TIP: A related name is the name of the
   */
  async fieldToRepresentation(field: Field, value: any, instance: any) {
    const isInstanceAnObject =
      typeof instance === 'object' && instance !== null;
    const constructorAsModelSerializer = this
      .constructor as typeof ModelSerializer;
    const isFieldOfTypeModelSerializer = field instanceof ModelSerializer;
    const fieldAsModelSerializer = field as ModelSerializer;

    if (
      isFieldOfTypeModelSerializer &&
      isInstanceAnObject &&
      fieldAsModelSerializer.isDynamicRepresentation
    ) {
      // Find if the field is a relation field, this means it should match directly the model it relates to.
      const modelInstance = (this.constructor as typeof ModelSerializer)
        ._modelInstance;

      let fieldEntries = Object.entries(
        constructorAsModelSerializer._foreignKeyFieldsOfModel
      );
      if (fieldEntries.length === 0) {
        fieldEntries = Object.entries(modelInstance.fields).filter(
          ([fieldName, field]) => {
            if (field instanceof models.fields.ForeignKeyField) {
              this.#appendForeignKeyFieldsOfModel(
                fieldName,
                field as models.fields.ForeignKeyField
              );
              return true;
            } else {
              return false;
            }
          }
        ) as [string, models.fields.ForeignKeyField][];
      }

      for (const [fieldName, instanceField] of fieldEntries) {
        const isFieldNameTheSameAsTheRelationName =
          field.fieldName === instanceField.relationName;
        if (isFieldNameTheSameAsTheRelationName) {
          const data = await (
            field.options.model as ReturnType<typeof models.Model>
          ).default.get(
            {
              [instanceField.toField]: instance[fieldName],
            },
            this.engineName
          );
          return super.fieldToRepresentation(field, data[0], instance);
        }
      }
      console.log(field.fieldName);
      console.log(fieldEntries);
    }
    /*
    if (
      isFieldOfTypeModelSerializer &&
      fieldAsModelSerializer.isDynamicRepresentation
    ) {
      const fieldEntries = Object.entries(modelInstance.fields);
      for (const [fieldName, instanceField] of fieldEntries) {
        // TODO: this is wrong
        const instanceFieldAsForeignField =
          instanceField as models.fields.ForeignKeyField;
        const isFieldNameTheSameAsTheRelationName =
          field.fieldName === instanceFieldAsForeignField.relationName;
      }
    }

    for (const [fieldName, instanceField] of fieldEntries) {
      // TODO: this is wrong
      const instanceFieldAsForeignField =
        instanceField as models.fields.ForeignKeyField;
      const isFieldNameTheSameAsTheRelatedName =
        field.fieldName === instanceFieldAsForeignField.relatedName;
      const isFieldNameTheSameAsTheRelationName =
        field.fieldName === instanceFieldAsForeignField.relationName;
      if (
        isFieldOfTypeModelSerializer &&
        isInstanceAnObject &&
        (isFieldNameTheSameAsTheRelatedName ||
          isFieldNameTheSameAsTheRelationName)
      ) {
        const data = await (
          field.options.model as ReturnType<typeof models.Model>
        ).default.get(
          {
            [instanceFieldAsForeignField.toField]: instance[fieldName],
          },
          this.engineName
        );
        const hasDataForField = data.length > 0;
        if (hasDataForField) {
          const isUnique = instanceField.unique;
          if (isUnique)
            return super.fieldToRepresentation(field, data[0], instance);
          else return super.fieldToRepresentation(field, data, instance);
        } else {
          break;
        }
      }
    }*/
    console.log(value);
    return super.fieldToRepresentation(field, value, instance);
  }

  async toRepresentation(
    data: M extends true
      ? ModelSerializerOutType<I, D, N, IR, WO, MO, IN, EX>[]
      : ModelSerializerOutType<I, D, N, IR, WO, MO, IN, EX> = this._instance
  ): Promise<this['outType']> {
    await this.#getSerializerModelFields();
    return super.toRepresentation(data);
  }

  async #getSerializerModelFields() {
    const database = new Database();
    const areFieldsDefined = Array.isArray(this.options.fields);
    const areExcludesDefined = Array.isArray(this.options.excludes);
    const constructorOfModelSerializer = this
      .constructor as typeof ModelSerializer;

    let modelInstance: InstanceType<ReturnType<typeof models.Model>>;
    if (constructorOfModelSerializer._modelInstance)
      modelInstance = constructorOfModelSerializer._modelInstance;
    else {
      modelInstance = new this.options.model();
      await modelInstance.initializeBasic();
      constructorOfModelSerializer._modelInstance = modelInstance;
    }

    let fieldEntries = Object.entries(modelInstance.fields);
    if (areFieldsDefined)
      fieldEntries = fieldEntries.filter(([fieldName]) =>
        this.options.fields?.includes(fieldName)
      );
    if (areExcludesDefined)
      fieldEntries = fieldEntries.filter(
        ([fieldName]) => this.options.excludes?.includes(fieldName) === false
      );

    for (const [fieldName, field] of fieldEntries) {
      const relatedOrNonRelatedField = await this.#getRelatedField(
        database,
        modelInstance,
        field as models.fields.ForeignKeyField
      );
      const relatedOrNonRelatedFieldTypeName =
        relatedOrNonRelatedField.constructor.name;
      if (fieldName in this.fields === false) {
        const SerializerFieldClass =
          this.#serializerFieldByModelField[relatedOrNonRelatedFieldTypeName];
        if (SerializerFieldClass === NumberField) {
          const NumberFieldClass = SerializerFieldClass as typeof NumberField;
          this.fields[fieldName] = NumberFieldClass.new({
            required: field.allowNull,
            allowNull: field.allowNull,
            defaultValue: field.defaultValue,
            maxDigits: (field as models.fields.DecimalField).maxDigits,
            decimalPlaces: (field as models.fields.DecimalField).decimalPlaces,
            isInteger:
              relatedOrNonRelatedFieldTypeName ===
                models.fields.IntegerField.name ||
              relatedOrNonRelatedFieldTypeName ===
                models.fields.BigIntegerField.name,
          });
        } else if (SerializerFieldClass === StringField) {
          const StringFieldClass = SerializerFieldClass as typeof StringField;
          this.fields[fieldName] = StringFieldClass.new({
            required: field.allowNull,
            allowNull: field.allowNull,
            allowBlank: (field as models.fields.CharField).allowBlank,
            isUUID:
              relatedOrNonRelatedFieldTypeName === models.fields.UUIDField.name,
          });
        }
      }
    }
  }
}
