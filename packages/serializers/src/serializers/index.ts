import ValidationError, {
  SerializerManyAndNotArrayError,
  SerializerShouldCallIsValidBeforeAccessingData,
} from '../exceptions';
import { Field } from '../fields';
import type {
  SerializerFieldsType,
  SerializerParamsType,
  SerializerType,
  SerializerParamsTypeForConstructor,
  OutSerializerType,
  InSerializerType,
} from './types';
import type { This } from '../types';
import type { FieldType, InFieldType, OutFieldType } from '../fields/types';
import Schema from '../schema';

/**
 * The serializer itself is treated as a field since we can have nested objects one inside of each other. But the idea is a lot different in serializers because
 * they hold other fields inside of it. Usually this will be the class you will be extending to create your schemas.
 */
export default class Serializer<
  I extends Serializer = any,
  M extends boolean = boolean,
  C = any,
  D extends SerializerType<I> | undefined = undefined,
  N extends boolean = boolean,
  R extends boolean = boolean,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  DR extends boolean = boolean,
  IR extends boolean = DR extends true ? false : R
> extends Field<I, D, N, R, RO, WO, C, IR> {
  type!: FieldType<SerializerType<I>, N, R, D>;
  inType!: M extends true
    ? InFieldType<FieldType<InSerializerType<I>, N, R, D>, RO>[]
    : InFieldType<FieldType<InSerializerType<I>, N, R, D>, RO>;
  outType!: M extends true
    ? OutFieldType<FieldType<OutSerializerType<I>, N, IR, D>, WO>[]
    : OutFieldType<FieldType<OutSerializerType<I>, N, IR, D>, WO>;

  protected _errors: ValidationError[] = [];
  fields = {} as SerializerFieldsType;
  protected _validatedData!: this['inType'];
  protected _instance: this['outType'];
  protected _many!: M;
  protected _data: this['inType'];

  constructor(
    params: SerializerParamsTypeForConstructor<I, M, C, N, R, RO, WO> = {}
  ) {
    super({
      ...params,
      errorMessages: {
        required: 'A data is required for this serializer',
        null: 'The value of this serializer cannot be null',
        ...params.errorMessages,
      },
    });

    const isManyDefined = typeof params.many === 'boolean';
    this._instance = params.instance as this['outType'];
    this._data = params.data as this['inType'];
    this._many = (isManyDefined ? params.many : false) as M;
    this.context = params.context ? params.context : ({} as C);
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
    params: SerializerParamsType<
      InstanceType<I>,
      M extends boolean ? M : boolean,
      C,
      D,
      N,
      R,
      RO,
      WO
    > = {}
  ) {
    return new this(params) as Serializer<
      InstanceType<I>,
      M,
      C,
      D,
      N,
      R,
      RO,
      WO
    >;
  }

  async schema<S extends Schema, R = ReturnType<S['getObject']>>(
    isIn = true,
    schema?: S
  ): Promise<R> {
    await super.schema(isIn, schema);
    return this._schema.getObject(this as Serializer, isIn);
  }

  /**
   * Responsible for retrieving the representation for each field of the serializer. So with this you can do some custom logic
   * BEFORE passing the value to the field `toRepresentation` method. This is useful for model serializers but can be
   * used for other custom serializers as well.
   *
   * @param field - The field that we are retrieving the representation for.
   * @param value - The value that will be passed to this field. This is the value like `instance['lastName']` for an instance like
   * `{ firstName: 'John', lastName: 'Doe' }`. So in this case the value would be `Doe`.
   * @param instance - The data instance of the serializer. This is the data with all of the fields. So in the example above this
   * would be `{ firstName: 'John', lastName: 'Doe' }`.
   *
   * @returns - The value that will be passed to the field `toRepresentation` method.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fieldToRepresentation(field: Field, value: any, instance: any) {
    return await field.toRepresentation(value);
  }

  /**
   * Responsible for retrieving the representation for each field of the serializer. So if you need to do some custom logic
   * or conversion this is exactly where you should do it.
   *
   * @param instance - The data instance of the serializer.
   */
  async instanceToRepresentation(
    instance: OutFieldType<FieldType<OutSerializerType<I>, N, IR, D>, WO>
  ) {
    const isInstanceAnObject =
      typeof instance === 'object' && instance !== null;
    const newInstance: {
      [key: string]: Field['outType'];
    } = {};
    const fieldEntries = Object.entries(this.fields);
    for (const [fieldName, field] of fieldEntries) {
      const value = isInstanceAnObject
        ? (instance as any)[fieldName]
        : undefined;
      field.fieldName = fieldName;
      field.context = this.context;
      const representationValue = await this.fieldToRepresentation(
        field,
        value,
        instance
      );
      const isRepresentationValueDefined = representationValue !== undefined;
      if (isRepresentationValueDefined)
        newInstance[fieldName] = representationValue;
    }
    return newInstance;
  }

  /**
   * This function is used to convert the data from the server to the client.
   * We do not do any validation here so you must try to guarantee in code that your data is properly formatted.
   *
   * On here you are able to transform a class for example in an object and so on. The hole idea here is to guarantee
   * that only the data the user has defined will be sent to the client.
   *
   * Same as the `toInternal`. If you need to convert the data of a specific field, try to use the field's toRepresentation
   * instead of overriding the `toRepresentation` method of the serializer.
   *
   * You must ALWAYS call `super.toRepresentation()` if you want to override this function.
   *
   * @data - The data that will be converted and validated.
   */
  async toRepresentation(
    data: M extends true
      ? OutFieldType<FieldType<OutSerializerType<I>, N, IR>, WO>[]
      : OutFieldType<FieldType<OutSerializerType<I>, N, IR, D>, WO> = this
      ._instance
  ): Promise<this['outType']> {
    const instanceOrDataNotDefined = data === undefined;
    const isManyAndIsNotArray = !Array.isArray(data) && this._many === true;
    let dataForRepresentation = isManyAndIsNotArray ? [data] : data;
    if (instanceOrDataNotDefined && isManyAndIsNotArray)
      dataForRepresentation = [];

    const isManyAndIsArray =
      Array.isArray(dataForRepresentation) && this._many === true;
    const isNotManyAndIsNotArray =
      !Array.isArray(dataForRepresentation) && this._many === false;

    if (isManyAndIsArray) {
      return (await Promise.all(
        (dataForRepresentation as []).map(async (data: this['type']) =>
          this.instanceToRepresentation(
            data as OutFieldType<FieldType<OutSerializerType<I>, N, IR, D>, WO>
          )
        )
      )) as this['outType'];
    } else if (isNotManyAndIsNotArray) {
      return (await this.instanceToRepresentation(
        dataForRepresentation as OutFieldType<
          FieldType<OutSerializerType<I>, N, IR, D>,
          WO
        >
      )) as this['outType'];
    } else throw new SerializerManyAndNotArrayError(this.constructor.name);
  }

  /**
   * Just a simple wrapper around `toRepresentation` so it'll be a lot easier to retrieve the data of the serializer.
   *
   * @returns - Returns the outSerializerType of the serializer, it will be all of the fields THAT ARE NOT `writeOnly: true`.
   */
  get data() {
    return this.toRepresentation(this._instance as this['outType']);
  }

  /**
   * This function is used to validate the serializer and append the errors inside of the `_errors` array.
   * After we finish validating we can retrieve the errors by calling the `serializer.errors`.
   *
   * We validate the serializer itself as well as it fields.
   *
   * @param data - The data of the serializer or of the field to validate.
   * @param field - If not `this`, this is a custom field instance to validate.
   *
   * @returns - Returns true if there are no validation errors otherwise returns false. We do not return the error
   * itself because it is appended in an array and this array will be sent to the client.
   */
  protected async _validateAndAppendError<F extends Field | Serializer = this>(
    data:
      | (M extends true
          ? InFieldType<FieldType<InSerializerType<I>, N, R, D>, RO>[]
          : InFieldType<FieldType<InSerializerType<I>, N, R, D>, RO>)
      | undefined,
    field?: F
  ) {
    const fieldInstance = field ? field : this;
    try {
      await fieldInstance.validate(data as this['inType']);
    } catch (error) {
      if (error instanceof ValidationError) {
        this._errors.push(error);
        return false;
      } else throw error;
    }
    return true;
  }

  /**
   * This is used to retrieve the data for every single data. This is useful to be overridden when you don't want to deal with
   * when the data is an array or when the data is an object. This let's you deal with every single object of the array.
   *
   * @param instance - The instance that you want to convert. The instance will usually be an object, And the object will usually have
   * the shape of the fields inside of the serializer.
   *
   * @returns - Returns the instance formatted for the object or the each element of the array that the serializer receives.
   */
  async instanceToInternal(
    instance: InFieldType<FieldType<InSerializerType<I>, N, R, D>, RO>
  ) {
    const isInstanceUndefinedOrNull =
      instance === null || instance === undefined;
    if (isInstanceUndefinedOrNull) return instance;

    const isInstanceAnObject = typeof instance === 'object';
    const newInstance: {
      [key: string]: Field['type'];
    } = {};

    const fieldEntries = Object.entries(this.fields);
    for (const [fieldName, field] of fieldEntries) {
      if (!field.readOnly) {
        const value = isInstanceAnObject
          ? (instance as any)[fieldName]
          : undefined;
        field.fieldName = fieldName;
        field.context = this.context;
        const isFieldASerializer = field instanceof Serializer;
        if (isFieldASerializer) field._errors = this._errors;

        const isValid = await this._validateAndAppendError(value, field);

        if (isValid) {
          const internalValue = await field.toInternal(value);
          const isInternalValueDefined = internalValue !== undefined;
          if (isInternalValueDefined) newInstance[fieldName] = internalValue;
        }
      }
    }
    return newInstance;
  }

  /**
   * This function will retrieve the data received from the client and convert it
   * so it can be used internally in the application. If you want to do any conversions
   * on the data retrieved to something else you can use this function. For example, if a field
   * retrieves an ISO date, you can convert this field to a date using this function.
   *
   * This is supposed to be used with caution since you can also define a `toInternal` function in
   * custom fields. For example:
   *
   * Instead of this:
   * ```
   * class MyCustomSerializer extends Serializer {
   *    fields = {
   *        isoField: new CharField()
   *    }
   *
   *    async toInternal() {
   *      const validatedData = await super.toInternal();
   *      validatedData.isoField = new Date(validatedData.isoField);
   *      return validatedData;
   *    }
   * }
   * ```
   *
   * Do this:
   * ```
   * class IsoDateField extends CharField {
   *    customErrorMessages = {
   *       invalid: 'Not a valid iso date'
   *    }
   *
   *    async validate(data) {
   *      await super.validate(data); // this will validate if the data is not null and other stuff.
   *      const isoRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{3}/;
   *      const isAValidIsoDate = isoRegex.test(data);
   *      if (isAValidIsoDate) await this.fail('invalid');
   *    }
   *
   *    async toInternal(data) {
   *      const validatedData = await super.toInternal();
   *      return new Date(validatedData);
   *    }
   * }
   *
   * class MyCustomSerializer extends Serializer {
   *    fields = {
   *        isoField: new IsoDateField()
   *    }
   * }
   * ```
   *
   * The above will guarantee that the IsoDate string is a valid iso date and can be safely converted to a date. You see
   * that the logic is added inside of the custom field instead of the serializer. This make it more concise and focused.
   * Also the logic in the custom field can be reused in other serializers.
   *
   * @returns - Returns the data of the serializer validated and formatted.
   */
  async toInternal(
    validatedData:
      | (M extends true
          ? InFieldType<FieldType<InSerializerType<I>, N, R, D>, RO>[]
          : InFieldType<FieldType<InSerializerType<I>, N, R, D>, RO>)
      | undefined = undefined
  ): Promise<this['inType'] | undefined> {
    const isManyAndIsArray =
      Array.isArray(validatedData) && this._many === true;
    const isNotManyAndIsNotArray =
      !Array.isArray(validatedData) && this._many === false;

    await this._validateAndAppendError(validatedData);

    const isDataAnObject =
      typeof validatedData === 'object' && validatedData !== null;
    if (isDataAnObject) {
      if (isManyAndIsArray) {
        return Promise.all(
          validatedData.map(async (data: Field['inType']) =>
            this.instanceToInternal(data)
          )
        ) as Promise<this['inType']>;
      } else if (isNotManyAndIsNotArray)
        return this.instanceToInternal(
          validatedData as InFieldType<
            FieldType<InSerializerType<I>, N, R, D>,
            RO
          >
        ) as Promise<this['inType']>;
      else throw new SerializerManyAndNotArrayError(this.constructor.name);
    }
  }

  /**
   * Object that holds the validated data instance or throw an error if `isValid()` was not called before.
   *
   * @throws - Throws an error if `isValid` was not called before.
   *
   * @returns - Returns the validated data with the default values and the values converted.
   */
  get validatedData(): this['inType'] {
    const isValidatedDataDefined = typeof this._validatedData !== 'undefined';
    if (isValidatedDataDefined) return this._validatedData as this['inType'];
    else
      throw new SerializerShouldCallIsValidBeforeAccessingData(
        this.constructor.name
      );
  }

  /**
   * This api is supposed to be called before saving. You won't be able to get the validated data until you
   * call the isValid function. This is important to guarantee that the data is valid before saving, we try to
   * guarantee the integrity of it.
   *
   * @returns - Returns true if the data sent is valid to the serializer and doesn't contain any errors or false otherwise.
   */
  async isValid(data: this['inType'] | undefined = undefined) {
    const isInstanceDefinedAndDataUndefined =
      this._data !== undefined && data === undefined;
    const instanceOrData = isInstanceDefinedAndDataUndefined
      ? this._data
      : data;

    const instanceOrDataNotDefined = instanceOrData === undefined;
    const isManyAndIsNotArray =
      !Array.isArray(instanceOrData) && this._many === true;
    let dataForInternal: any = isManyAndIsNotArray
      ? [instanceOrData]
      : instanceOrData;
    if (instanceOrDataNotDefined && isManyAndIsNotArray) dataForInternal = [];
    dataForInternal = (await super.toInternal(
      dataForInternal as this['inType']
    )) as this['inType'];

    const isSerializerValid = await this._validateAndAppendError(
      dataForInternal
    );
    if (!isSerializerValid) return false;

    const validatedData = await this.toInternal(dataForInternal);
    const isValid = this._errors.length === 0;
    if (isValid) {
      this._validatedData = validatedData as this['inType'];
      return true;
    }

    return false;
  }

  /**
   * Retrieves all of the errors of the serializer as a list so we can traverse it inside of the application.
   */
  get errors() {
    return this._errors.map((error) => error.json);
  }
}
