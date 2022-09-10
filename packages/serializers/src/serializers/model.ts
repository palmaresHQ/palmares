import { Database, ModelFields, models } from '@palmares/databases';

import Serializer from '.';
import type {
  SerializerType,
  SerializerFieldsType,
  InSerializerType,
  OutSerializerType,
  SerializerParamsTypeForConstructor,
  ModelSerializerOptions,
  ModelSerializerParamsType,
} from './types';
import type { This } from '../types';
import type { FieldType, InFieldType, OutFieldType } from '../fields/types';
import { InvalidModelOnModelSerializerError } from '../exceptions';
import { NumberField, StringField } from '../fields';

export default class ModelSerializer<
  I extends ModelSerializer = any,
  M extends boolean = boolean,
  C = any,
  D extends SerializerType<I> | undefined = undefined,
  N extends boolean = boolean,
  R extends boolean = boolean,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  MO extends ReturnType<typeof models.Model> = ReturnType<typeof models.Model>,
  IN extends keyof ModelFields<InstanceType<MO>> = any,
  EX extends keyof ModelFields<InstanceType<MO>> = any
> extends Serializer<I, M, C, D, N, R, RO, WO> {
  type!: FieldType<SerializerType<I>, N, R, D> &
    Pick<
      ModelFields<InstanceType<MO>>,
      Exclude<keyof InstanceType<MO>['fields'], EX>
    > &
    Pick<ModelFields<InstanceType<MO>>, IN>;
  inSerializerType!: InFieldType<
    FieldType<
      InSerializerType<I> &
        Pick<
          ModelFields<InstanceType<MO>>,
          Exclude<keyof InstanceType<MO>['fields'], EX>
        > &
        Pick<ModelFields<InstanceType<MO>>, IN>,
      N,
      R,
      D
    >,
    RO
  >;
  inType!: M extends true
    ? this['inSerializerType'][]
    : this['inSerializerType'];
  outSerializerType!: OutFieldType<
    FieldType<
      OutSerializerType<I> &
        Pick<
          ModelFields<InstanceType<MO>>,
          Exclude<keyof InstanceType<MO>['fields'], EX>
        > &
        Pick<ModelFields<InstanceType<MO>>, IN>,
      N,
      R,
      D
    >,
    WO
  >;
  outType!: M extends true
    ? this['outSerializerType'][]
    : this['outSerializerType'];
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

  fields = {} as SerializerFieldsType;
  options = {} as ModelSerializerOptions<MO>;

  constructor(
    params: SerializerParamsTypeForConstructor<I, M, C, N, R, RO, WO> = {}
  ) {
    super(params);
    //const isModelNotDefined = !(this.options.model instanceof models.BaseModel);
    //console.log(this);
    //if (isModelNotDefined) throw new InvalidModelOnModelSerializerError(this.constructor.name, this.options.model);
  }

  static new<
    I extends This<typeof Serializer>,
    M extends boolean = false,
    C = any,
    D extends SerializerType<InstanceType<I>> | undefined = undefined,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = false,
    WO extends boolean = false
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

  /**
   * This is responsible for retrieving the actual field type if the field is a related field. Since we can be related to a uuid
   * instead of an integer and so on we need to retrieve the actual field type that this field needs to be. If this field is related to a uuid
   * don't you agree that the type of the field should be an StringField instead of a NumberField? That's exactly what this does.
   *
   * @param database
   * @param model
   * @param field
   * @returns
   */
  async #getRelatedField(
    database: Database,
    model: InstanceType<ReturnType<typeof models.Model>>,
    field: models.fields.ForeignKeyField
  ) {
    if (field instanceof models.fields.ForeignKeyField) {
      const isARecursiveRelation = model.constructor.name === field.relatedTo;
      if (isARecursiveRelation) {
        if (model.fields[field.toField]) return model.fields[field.toField];
      }

      for (const dependentModel of this.options?.dependsOn || []) {
        const isTheDependentModelTheOneRelatedToTheField =
          dependentModel.name === field.relatedTo;
        if (isTheDependentModelTheOneRelatedToTheField) {
          const relatedModelInstance = new this.options.model();
          await relatedModelInstance.initializeBasic();
          if (relatedModelInstance.fields[field.toField])
            return relatedModelInstance.fields[field.toField];
        }
      }

      const modelsInApplication = await database.getModels();
      const modelInApplication = modelsInApplication[field.relatedTo];
      if (modelInApplication) {
        const relatedModelInstance = new modelInApplication.model();
        await relatedModelInstance.initializeBasic();
        if (relatedModelInstance.fields[field.toField])
          return relatedModelInstance.fields[field.toField];
      }
      throw new Error('no related model found for the field');
    }
    return field;
  }

  async toRepresentation(
    data: M extends true
      ? OutFieldType<FieldType<OutSerializerType<I>, N, R>, WO>[]
      : OutFieldType<FieldType<OutSerializerType<I>, N, R, D>, WO> = this
      ._instance
  ): Promise<this['outType']> {
    await this.#getSerializerModelFields();
    return super.toRepresentation(data);
  }

  async #getSerializerModelFields() {
    const database = new Database();
    const areFieldsDefined = Array.isArray(this.options.fields);
    const areExcludesDefined = Array.isArray(this.options.excludes);
    const modelInstance = new this.options.model();
    await modelInstance.initializeBasic();

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
