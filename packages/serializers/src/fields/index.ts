import log from "../logging";
import { LOGGING_NOT_FOUND_WARN_MESSAGE } from "../utils";
import ValidationError, { FieldSourcesError } from "../exceptions";
import { settings } from "../settings";
import { FieldParamsType, CharFieldParamsType, FieldType } from './types';
import { ErrorMessagesType, This } from "../types"

export class Empty {}

/**
 * A field represents all fields in Palmares serializers even a serializer itself. This is tightly based on Django Rest Framework, you will view
 * we almost copied everything except for a few changes.
 *
 * You might ask yourself, why did you create it? Why do you need this? Simple, one of the things i like most about DRF is the possibility to
 * customize and define not just the data we receive but also the data we send. I know it is less optimized than just send the data directly,
 * we are able to change this in the future, but unless we start having issues with this we can use serializers on how we receive the data
 * and how we will send the data for the users.
 *
 * Okay so how does this work? We have to functions that are extremely important: toInternal and toRepresentation.
 * - `toRepresentation()` defines and formats the data we will send for the client.
 * - `toInternal()` defines and formats the data we receive from the client.
 *
 * Example use cases:
 * ```
 * class ISO8601DateField extends serializers.Field {
 *      toInternal(data) {
 *          if (data instanceof String) {
 *              return new Date(data)
 *          } else {
 *              throw new serializers.ValidationError({reason: 'Should be a String'})
 *          }
 *      }
 *      toRepresentation(data) {
 *          if (data instanceof Date) {
 *              return data.toISOString()
 *          } else {
 *              throw new serializers.ValidationError({reason: 'Should be a Date object'})
 *          }
 *      }
 * }
 *
 * class ExampleToRepresentation extends serializers.Serializer {
 *      fields = {
 *          customDate: new models.ISO8601DateField()
 *      }
 * }
 *
 * serializer = new ExampleRepresentation({
 *      instance: {
 *          customDate: new Date()
 *      }
 * })
 *
 * serializer.toRepresentation()
 * ```
 *
 * this will convert the instance data to a way you want to represent. This way, customDate date object will be converted to a string.
 * See that in the toRepresentation method we already do all of the validation needed to represent the value.
 *
 * This works similarly the other way around, when we want to convert data received from the user.
 */
export class Field<
  I extends Field = any,
  D extends any | typeof Empty = any,
  N extends boolean = boolean,
  R extends boolean = boolean,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  C = any
> {
  #fieldName!: string;

  type!: FieldType<any, N, R, RO, WO>;
  context = {} as C;
  source: string | undefined;
  required: boolean;
  defaultValue: this["type"] | typeof Empty;
  allowNull: boolean;
  readOnly: boolean;
  writeOnly: boolean;
  errorMessages: {
    [key: string | symbol]: ErrorMessagesType;
  }

  #defaultParams: FieldParamsType<I, D, N, R, RO, WO> = {
    source: undefined,
    required: true as R,
    defaultValue: Empty as D,
    allowNull: false as N,
    readOnly: false as RO,
    writeOnly: false as WO,
    errorMessages: {}
  }

  constructor(params: FieldParamsType<I, D, N, R, RO, WO> = {}) {
    this.errorMessages = {
      required: 'This field is required.',
      null: 'The field cannot be null',
      ...params.errorMessages,
    };

    const isRequiredDefined = typeof params.required === 'boolean';
    const isAllowNullDefined = typeof params.allowNull === 'boolean';
    const isReadOnlyDefined = typeof params.readOnly === 'boolean';
    const isWriteOnlyDefined = typeof params.writeOnly === 'boolean';

    this.source = params.source || this.#defaultParams.source;
    this.required = (isRequiredDefined ? params.required : this.#defaultParams.required) as boolean;
    this.defaultValue = params.defaultValue || this.#defaultParams.defaultValue;
    this.allowNull = (isAllowNullDefined ? params.allowNull : this.#defaultParams.allowNull) as boolean;
    this.readOnly = (isReadOnlyDefined ? params.readOnly : this.#defaultParams.readOnly) as boolean;
    this.writeOnly = (isWriteOnlyDefined ? params.writeOnly : this.#defaultParams.writeOnly) as boolean;
  }

  static new<
    I extends This<typeof Field>,
    D extends InstanceType<I>["type"] | typeof Empty = typeof Empty,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = boolean,
    WO extends boolean = boolean,
    C = any
  >(
    params: FieldParamsType<InstanceType<I>,D, N, R, RO, WO> = {}
  ) {
    return new this(params) as Field<InstanceType<I>, D, N, R, RO, WO, C>;
  }

  get fieldName() {
    return this.#fieldName;
  }

  set fieldName(name: string) {
    const isFieldNameNotDefined = typeof this.#fieldName !== 'string';
    if (isFieldNameNotDefined) this.#fieldName = name;
  }

  /**
   * Method to throw validation errors when something happen inside of the application.
   *
   * By default it will try to find the default error messages defined in the settings.(ts/js), if
   * it cannot find it will use the error messages defined on the class itself.
   *
   * @param errorKey - The key of the error message to be thrown.
   */
  async fail(errorKey: string) {
    const defaultRootErrorMessage = settings?.ERROR_MESSAGES ? settings.ERROR_MESSAGES[errorKey] : null
    const message = defaultRootErrorMessage || this.errorMessages[errorKey];

    if (message) {
      const isErrorMessageAFunction = typeof message === 'function';
      const errorMessage = isErrorMessageAFunction ? await Promise.resolve(message()) : message;
      const ValidationErrorClass = settings?.ERROR_CLASS as typeof ValidationError;
      const isFieldNameDefined = typeof this.fieldName === 'string';
      const meta = isFieldNameDefined ? {
        fieldName: this.fieldName
      } : undefined;

      throw new ValidationErrorClass({
        reason: errorKey,
        description: errorMessage,
        meta
      });
    } else {
      log(LOGGING_NOT_FOUND_WARN_MESSAGE, { errorKey });
    }
  }

  async _getSource(instance: any): Promise<any> {
    const sourceAsString = this.source as string;
    const isSourceToRetrieveHoleObject = sourceAsString === '*';
    const isSourceDefinedAndNotWriteOnly = typeof sourceAsString === 'string' &&
      this.writeOnly === false;
    if (!isSourceDefinedAndNotWriteOnly || isSourceToRetrieveHoleObject) return instance;

    let newInstance = undefined;
    const splittedSource = sourceAsString.split('.');
    for (const key of splittedSource) {
      const isValueDefined = instance[key] !== undefined;
      if (isValueDefined) newInstance = instance[key];
      else throw new FieldSourcesError(this.constructor.name, sourceAsString, instance);
    }
    return newInstance;
  }

  async _getDefaultValue(data: this['type']) {
    const dataIsNotDefined = data === undefined;
    const defaultValueIsNotEmpty = this.defaultValue !== Empty;
    if (dataIsNotDefined && defaultValueIsNotEmpty) data = this.defaultValue;
    return data as any;
  }

  async toRepresentation(
    data?: this['type'],
    callbackIfDefined?: (data: Exclude<this['type'], null | undefined> ) => Promise<this["type"]> | this["type"]
  ) : Promise<this['type'] | Array<this["type"]> | undefined | null>{
    const isWriteOnly = this.writeOnly;
    if (isWriteOnly) return undefined;

    const sourceData = await this._getSource(data);
    const formattedData = await this._getDefaultValue(sourceData);
    const isDataNotNullNorUndefined = ![null, undefined].includes(formattedData);
    if (this.writeOnly) return undefined;
    if (callbackIfDefined && isDataNotNullNorUndefined) return callbackIfDefined(formattedData);
    return data;
  }

  async validate(data: any) {
    const isDataDefined = data !== undefined;
    const isDataNullAndDoesNotAllowNull = data === null && this.allowNull === false;
    const isRequiredAndNotReadOnly = this.required === true && this.readOnly === false;
    if (!isDataDefined && isRequiredAndNotReadOnly) await this.fail('required');
    if (isDataNullAndDoesNotAllowNull) await this.fail('null');
  }

  async toInternal(data?: any) {
    const formattedData = await this._getDefaultValue(data);
    return formattedData
  }
}

export class CharField<
  I extends CharField = any,
  D extends I["type"] | typeof Empty = typeof Empty,
  N extends boolean = false,
  R extends boolean = true,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  C = any
> extends Field<I, D, N, R, RO, WO, C> {

  type!: FieldType<string, N, R, RO, WO>;
  minLength?: number;
  maxLength?: number;
  allowBlank: boolean;

  constructor(params: CharFieldParamsType<I, D, N, R, RO, WO> = {}) {
    super(params);

    const isAllowBlankABoolean = typeof params.allowBlank === 'boolean';
    const isMinLengthDefined = typeof params.minLength === 'number';
    const isMaxLengthDefined = typeof params.maxLength === 'number';

    this.allowBlank = isAllowBlankABoolean ? params.allowBlank as boolean : false;
    if (isMaxLengthDefined) this.maxLength = params.maxLength;
    if (isMinLengthDefined) this.minLength = params.minLength;

    this.errorMessages = {
      invalid: 'Not a valid string',
      maxLength: `Make sure this field is not logger than ${params.maxLength} character(s) long.`,
      minLength: `Make sure this field is at least ${params.minLength} character(s) long.`,
      blank: 'The field cannot be blank',
      ...this.errorMessages,
    }
  }

  static new<
    I extends This<typeof CharField>,
    D extends string | typeof Empty = typeof Empty,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = boolean,
    WO extends boolean = boolean,
    C = any
  >(
    params: CharFieldParamsType<InstanceType<I>, D, N, R, RO, WO> = {}
  ) {
    return new this(params) as CharField<InstanceType<I>,D, N, R, RO, WO, C>;
  }

  async validate(data: any) {
    await super.validate(data);

    const isDataNull = data === null;
    if (isDataNull) return;

    const isDataNotAString = typeof data !== 'string';
    if (isDataNotAString) await this.fail('invalid');

    const isLengthAboveMaxLength = this.maxLength && data.length > this.maxLength;
    if (isLengthAboveMaxLength) await this.fail('maxLength');

    const isLengthBelowMinLength = this.minLength && data.length < this.minLength;
    if (isLengthBelowMinLength) await this.fail('maxLength');

    const isBlank = this.allowBlank === false && data === '';
    if (isBlank) await this.fail('blank')
  }

  async toInternal(data: string | null) {
    const formattedData = await super.toInternal(data);
    if (formattedData === null) return null;
    return formattedData.toString();
  }

  async toRepresentation(data: this["type"]) {
    return super.toRepresentation(data, (data) => data.toString()) ;
  }
}
