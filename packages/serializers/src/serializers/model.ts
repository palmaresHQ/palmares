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

  /**
   * This will append the foreign key fields of the model to the serializer fields.
   *
   * This way we do not need to retrieve and search for them every time we need to use them.
   *
   * This makes it not really performant on the first run but it becomes performant after the first one.
   *
   * @param fieldName - Te name of the field that this foreign key field is related to. (the toField param).
   * @param field - The foreign key field that is related to the field name.
   */
  #appendForeignKeyFieldsOfOtherModelsRelatedToModel(
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
   * This can be kinda strange because when you are using the ForeignKeyField you sometimes will be passing the actual model instead
   * of the string. But on the field itself we will always be storing the relatedTo as a string instead of the actual model. If we stored
   * the actual model we would have a circular dependency and it would not work. So because of this relatedTo is ALWAYS a string. This is
   * why we need to search for this string on the dependencies and if not found on the actual database.
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
        this.#appendForeignKeyFieldsOfOtherModelsRelatedToModel(
          foundRelatedField.fieldName as string,
          foundRelatedField
        );
        return foundRelatedField;
      }
    }
    return field;
  }

  /**
   * To retrieve the value dynamically, first the instance received should be an object and not null since we will be using the
   * values from this object. The type of the serializer should be a model serializer and isDynamicRepresentation should be true.
   *
   * @param field - The field instance that should be a ModelSerializer.
   * @param instance - The instance to retrieve the data for.
   *
   * @returns - Returns true if it is to get the value dynamically and false otherwise.
   */
  async #isToGetValueDynamically(field: Field, instance: any) {
    const isInstanceAnObject =
      typeof instance === 'object' && instance !== null;
    const isFieldOfTypeModelSerializer = field instanceof ModelSerializer;
    return (
      isInstanceAnObject &&
      isFieldOfTypeModelSerializer &&
      field.isDynamicRepresentation
    );
  }

  /**
   * This is better explained in `fieldToRepresentation` method. This will be used to retrieve the values of the direct relation. One thing to notice
   * is that the retrieved value is always unique.
   *
   * @param field - The field instance that should be a ModelSerializer.
   * @param instance - The instance to retrieve the data for.
   *
   * @returns - Returns and object with the value of the model serializer.
   */
  async #getDirectRelationData(field: ModelSerializer, instance: any) {
    if (await this.#isToGetValueDynamically(field, instance)) {
      const constructorAsModelSerializer = this
        .constructor as typeof ModelSerializer;
      const modelInstance = constructorAsModelSerializer._modelInstance;
      const fieldEntries = Object.entries(modelInstance.fields).filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, field]) => {
          return field instanceof models.fields.ForeignKeyField;
        }
      ) as [string, models.fields.ForeignKeyField][];
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
          return data[0];
        }
      }
    }
  }

  /**
   * This is more tricky and is better explained in the `fieldToRepresentation` method but the idea is that
   * for `relatedNames` we get the representation of the other model. if we have the following field:
   *
   * ```
   * new models.fields.ForeignKeyField({
   *    relatedTo: User,
   *    onDelete: models.fields.ON_DELETE.CASCADE,
   *    toField: 'uuid',
   *    relatedName: 'userPosts',
   *    relationName: 'user',
   * }),
   * ```
   *
   * When we retrieve the data for the `User` model we can add the `userPosts` so it will retrieve the posts of the user.
   *
   * @param field - The field instance that should be a ModelSerializer.
   * @param instance - The instance to retrieve the data for so we can traverse the data it relates to.
   *
   * @returns - Returns an array of objects with the value of the model serializer.
   */
  async #getRelatedData(field: ModelSerializer, instance: any) {
    if (await this.#isToGetValueDynamically(field, instance)) {
      const fieldConstructorAsModelSerializer =
        field.constructor as typeof ModelSerializer;
      let modelInstanceOfField =
        fieldConstructorAsModelSerializer._modelInstance;
      const modelInstanceOfFieldIsNotDefined =
        modelInstanceOfField === undefined;
      if (modelInstanceOfFieldIsNotDefined) {
        modelInstanceOfField = new field.options.model();
        await modelInstanceOfField.initializeBasic();
        fieldConstructorAsModelSerializer._modelInstance = modelInstanceOfField;
      }

      const fieldEntriesOfFieldModel = Object.entries(
        modelInstanceOfField.fields
      ).filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, field]) => {
          return field instanceof models.fields.ForeignKeyField;
        }
      ) as [string, models.fields.ForeignKeyField][];

      // RECURSIVE RELATIONS
      for (const [fieldName, instanceField] of fieldEntriesOfFieldModel) {
        const isFieldNameTheSameAsTheRelatedName =
          field.fieldName === instanceField.relatedName &&
          this.options.model.name === instanceField.relatedTo;
        if (isFieldNameTheSameAsTheRelatedName) {
          const data = await (
            field.options.model as ReturnType<typeof models.Model>
          ).default.get(
            {
              [fieldName]: instance[instanceField.toField],
            },
            this.engineName
          );
          if (instanceField.unique) return data[0];
          else return data;
        }
      }
    }
  }

  /**
   * If the user define a field with the relatedName or a relationName and isDynamicRepresentation is set to true we
   * retrieve the values of this field dynamically. We have two ways of relating data: the relationName and the relatedName.
   * The difference of both is that relatedName is the relation on the model that this field relates to and the relationName defines
   * the name of the relation in the model. The related name is the name of the relation on the model it relates to. This can be
   * better explained with an example:
   *
   * @example
   * ```
   * export class Post extends models.Model<Post>() {
   *    fields = {
   *      id: new models.fields.AutoField(),
   *      description: new models.fields.TextField(),
   *      userUuid: new models.fields.ForeignKeyField({
   *        relatedTo: User,
   *        onDelete: models.fields.ON_DELETE.CASCADE,
   *        toField: 'uuid',
   *        relatedName: 'userPosts',
   *        relationName: 'user',
   *      }),
   *    };
   *
   *    options = {
   *      tableName: 'post',
   *    };
   * }
   *
   * export class User extends models.Model<User>() {
   *    fields = {
   *      id: new models.fields.AutoField(),
   *      firstName: new models.fields.CharField({ maxLength: 255, dbIndex: true }),
   *      lastName: new models.fields.CharField({ maxLength: 255, allowNull: true }),
   *      uuid: new models.fields.UUIDField({ autoGenerate: true, unique: true }),
   *   };
   *
   *    options = {
   *      tableName: 'user',
   *    };
   * }
   * ```
   *
   * On the example above we have a relation between the User and the Post model. The relationName of userUuid Post model is the name of the relation on the Post model.
   * This means that if every Post is tied to the user, what is the user? It's the userUuid field. The relatedName is more complicated. A User can be tied to N Posts.
   * What are those posts the user is tied to? It usually is a list, but if userUuid is unique, this means each post should be tied to only one user, so it does not
   * return an array but a single object.
   *
   * That's exactly the idea.
   *
   * @param field - The field to retrieve the representation for.
   * @param value - The value of the field, can be undefined on some cases.
   * @param instance - The instance of the model.
   *
   * @returns - The representation of the field by calling the field's `.toRepresentation` method.
   */
  async fieldToRepresentation(field: Field, value: any, instance: any) {
    if (await this.#isToGetValueDynamically(field, instance)) {
      let newValue = await this.#getDirectRelationData(
        field as ModelSerializer,
        instance
      );
      if (newValue === undefined)
        newValue = await this.#getRelatedData(
          field as ModelSerializer,
          instance
        );
      if (newValue !== undefined)
        return super.fieldToRepresentation(field, newValue, instance);
    }
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

  async toInternal(
    validatedData:
      | (M extends true
          ? ModelSerializerInType<I, D, N, R, RO, MO, IN, EX>[]
          : ModelSerializerInType<I, D, N, R, RO, MO, IN, EX>)
      | undefined = undefined
  ): Promise<this['inType'] | undefined> {
    await this.#getSerializerModelFields();
    return super.toInternal(validatedData);
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

    // eslint-disable-next-line prefer-const
    for (const [fieldName, field] of fieldEntries) {
      const isFieldAForeignKeyField =
        field instanceof models.fields.ForeignKeyField;
      let relatedOrNonRelatedField = field;
      if (isFieldAForeignKeyField) {
        relatedOrNonRelatedField = await this.#getRelatedField(
          database,
          modelInstance,
          field as models.fields.ForeignKeyField
        );
      }
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
            defaultValue: relatedOrNonRelatedField.defaultValue,
            maxDigits: (relatedOrNonRelatedField as models.fields.DecimalField)
              .maxDigits,
            decimalPlaces: (
              relatedOrNonRelatedField as models.fields.DecimalField
            ).decimalPlaces,
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
            allowBlank: (relatedOrNonRelatedField as models.fields.CharField)
              .allowBlank,
            isUUID:
              relatedOrNonRelatedFieldTypeName === models.fields.UUIDField.name,
          });
        }
      }
    }
  }
}
