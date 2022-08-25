import ValidationError, { SerializerManyAndNotArrayError, SerializerShouldCallIsValidBeforeAccessingData } from './exceptions';
import { Field } from './fields';
import { FieldParamsType, SerializerFieldsType, SerializerParamsType } from './types';

type This<T extends new(...args: any) => any> = {
  new(...args: ConstructorParameters<T>): any
} & Pick<T, keyof T>


export class Serializer<I extends Serializer = any, M extends boolean = boolean, C = any> extends Field<C> {
  protected _errors: ValidationError[] = [];
  fields: SerializerFieldsType = {};
  type!:{ [K in keyof I["fields"]] : I["fields"][K]["type"] };
  #validatedData!: M extends false ? this["type"] : this["type"][];
  #instance: any;
  many!: M;
  #data: any;

  /*constructor(params: SerializerParamsType<I extends Serializer ? I : never, M extends boolean ? M : boolean, C>) {
    super(
      {
        ...params,
        errorMessages: {
          required: 'A data is required for this serializer',
          null: 'The value of this serializer cannot be null',
          ...params.errorMessages,
        }
      }
    );

    const isManyDefined = typeof params.many === 'boolean';
    this.#instance = params.instance;
    this.#data = params.data;
    this.many = (isManyDefined ? params.many : false) as M;
    this.context = params.context ? params.context : {} as C;
  }*/

  async instanceToRepresentation(instance: this["type"]) {
    const isInstanceAnObject = typeof instance === 'object' && instance !== null;
    const newInstance: {
      [key: string]: Field["type"];
    } = {};
    const fieldEntries = Object.entries(this.fields);
    for (const [fieldName, field] of fieldEntries) {
      const value = isInstanceAnObject ? instance[fieldName] : undefined;
      field.fieldName = fieldName;
      field.context = this.context;
      const representationValue = await field.toRepresentation(value);
      if (representationValue) newInstance[fieldName] = representationValue;
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
   * You must ALWAYS call `super.toRepresentation()` if you want to override this function. For
   */
  async toRepresentation(data: this["type"] = this.#instance): Promise<any> {
    const instanceOrDataNotDefined = data === undefined;
    const isManyAndIsNotArray = !Array.isArray(data) && this.many === true;
    let dataForRepresentation = isManyAndIsNotArray ? [data] : data;
    if (instanceOrDataNotDefined && isManyAndIsNotArray) dataForRepresentation = [];

    const isManyAndIsArray = Array.isArray(dataForRepresentation) && this.many === true;
    const isNotManyAndIsNotArray = !Array.isArray(dataForRepresentation) && this.many === false;

    if (isManyAndIsArray) {
      return Promise.all(
        (dataForRepresentation as []).map(async (data: this["type"]) => this.instanceToRepresentation(data))
      );
    } else if (isNotManyAndIsNotArray) return this.instanceToRepresentation(dataForRepresentation as this["type"]);
    else throw new SerializerManyAndNotArrayError(this.constructor.name);
  }

  async #validateAndAppendError<F extends Field | Serializer = this>(data: F['type'] | F['type'][] | undefined, field?: F) {
    const fieldInstance = field ? field : this;
    try {
      await fieldInstance.validate(data);
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
  async instanceToInternal(instance: any) {
    const isInstanceUndefinedOrNull = [undefined, null].includes(instance);
    if (isInstanceUndefinedOrNull) return instance;

    const isInstanceAnObject = typeof instance === 'object';
    const newInstance: {
      [key: string]: Field["type"];
    } = {};

    const fieldEntries = Object.entries(this.fields);
    for (const [fieldName, field] of fieldEntries) {
      if (!field.readOnly) {
        const value = isInstanceAnObject ? instance[fieldName] : undefined;
        field.fieldName = fieldName;
        field.context = this.context;
        const isFieldASerializer = field instanceof Serializer;
        if (isFieldASerializer) field._errors = this._errors;

        const isValid = await this.#validateAndAppendError(value, field);

        if (isValid) {
          const internalValue = await field.toInternal(value);
          if (internalValue) newInstance[fieldName] = internalValue;
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
  async toInternal(validatedData: this["type"] | this["type"][] | undefined = undefined) {
    const isManyAndIsArray = Array.isArray(validatedData) && this.many === true;
    const isNotManyAndIsNotArray = !Array.isArray(validatedData) && this.many === false;

    await this.#validateAndAppendError(validatedData);

    const isDataAnObject = typeof validatedData === 'object' && validatedData !== null;
    if (isDataAnObject) {
      if (isManyAndIsArray) {
        return Promise.all(
          validatedData.map(async (data: Field["type"]) => this.instanceToInternal(data))
        );
      } else if (isNotManyAndIsNotArray) return this.instanceToInternal(validatedData);
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
  get validatedData(): M extends false ? this["type"] : this["type"][] {
    const isValidatedDataDefined = typeof this.#validatedData !== 'undefined'
    if (isValidatedDataDefined) return this.#validatedData;
    else throw new SerializerShouldCallIsValidBeforeAccessingData(this.constructor.name);
  }

  /**
   * This api is supposed to be called before saving. You won't be able to get the validated data until you
   * call the isValid function. This is important to guarantee that the data is valid before saving, we try to
   * guarantee the integrity of it.
   *
   * @returns - Returns true if the data sent is valid to the serializer and doesn't contain any errors or false otherwise.
   */
  async isValid(data: this["type"] | undefined = undefined) {
    const isInstanceDefinedAndDataUndefined = this.#data !== undefined && data === undefined;
    const instanceOrData = isInstanceDefinedAndDataUndefined ? this.#data : data;

    const instanceOrDataNotDefined = instanceOrData === undefined;
    const isManyAndIsNotArray = !Array.isArray(instanceOrData) && this.many === true;
    let dataForInternal: this["type"] | this["type"][] = isManyAndIsNotArray ? [instanceOrData] : instanceOrData;
    if (instanceOrDataNotDefined && isManyAndIsNotArray) dataForInternal = [];
    dataForInternal = (await super.toInternal(dataForInternal));

    const isSerializerValid = await this.#validateAndAppendError(dataForInternal);
    if (!isSerializerValid) return false;

    const validatedData = await this.toInternal(dataForInternal);
    const isValid = this._errors.length === 0;
    if (isValid) {
      this.#validatedData = validatedData;
      return true;
    }

    return false;
  }

  /**
   * Retrieves all of the errors of the serializer as a list so we can traverse it inside of the application.
   */
  get errors() {
    return this._errors.map(error => error.json)
  }

  static new<T extends This<typeof Serializer>, M extends boolean = boolean, C = any>(this: T, params: {
    instance?: { [K in keyof InstanceType<T>["fields"]] : InstanceType<T>["fields"][K]["type"] };
    data?: { [K in keyof InstanceType<T>["fields"]] : InstanceType<T>["fields"][K]["type"] };
    many?: M;
    context?: C
  } & FieldParamsType): Serializer<InstanceType<T>, M, C> {
    const serializer = new this(params);
    const isManyDefined = typeof params.many === 'boolean';
    serializer.#instance = params.instance;
    serializer.#data = params.data;
    serializer.many = (isManyDefined ? params.many : false) as M;
    serializer.context = params.context ? params.context : {} as C;
    return serializer as Serializer<InstanceType<T>, M, C>;
  }
}
