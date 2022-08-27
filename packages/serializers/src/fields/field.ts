import log from "../logging";
import { LOGGING_NOT_FOUND_WARN_MESSAGE } from "../utils";
import ValidationError, { FieldSourcesError } from "../exceptions";
import { settings } from "../settings";
import { FieldParamsType, InFieldType, OutFieldType, FieldType, CallbackIfDefinedToInternal, CallbackIfDefinedToRepresentation } from './types';
import { ErrorMessagesType, This } from "../types"

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
export default class Field<
  I extends Field = any,
  D extends any | undefined = any,
  N extends boolean = boolean,
  R extends boolean = boolean,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  C = any
> {
  #fieldName!: string;

  type!: FieldType<any, N, R>;
  inType!: InFieldType<FieldType<any, N, R>, RO> | InFieldType<FieldType<any, N, R>, RO>[];
  outType!: OutFieldType<FieldType<any, N, R>, WO> | OutFieldType<FieldType<any, N, R>, WO>[];

  context = {} as C;
  source: string | undefined;
  required: R;
  defaultValue?: D;
  allowNull: N;
  readOnly: RO;
  writeOnly: WO;
  errorMessages: {
    [key: string | symbol]: ErrorMessagesType;
  }

  #defaultParams: FieldParamsType<I, D, N, R, RO, WO> = {
    source: undefined,
    required: true as R,
    defaultValue: undefined as D,
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
    this.required = (isRequiredDefined ? params.required : this.#defaultParams.required) as R;
    this.defaultValue = params.defaultValue || this.#defaultParams.defaultValue as D;
    this.allowNull = (isAllowNullDefined ? params.allowNull : this.#defaultParams.allowNull) as N;
    this.readOnly = (isReadOnlyDefined ? params.readOnly : this.#defaultParams.readOnly) as RO;
    this.writeOnly = (isWriteOnlyDefined ? params.writeOnly : this.#defaultParams.writeOnly) as WO;
  }

  static new<
    I extends This<typeof Field>,
    D extends InstanceType<I>["inType"] | undefined = undefined,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = false,
    WO extends boolean = false,
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

  protected async _getDefaultValue(data: undefined): Promise<D> {
    const dataIsNotDefined = data === undefined;
    const defaultValueIsNotUndefined = this.defaultValue !== undefined;
    let dataWithDefaultValue: any  = data;
    if (dataIsNotDefined && defaultValueIsNotUndefined) dataWithDefaultValue = this.defaultValue;
    return dataWithDefaultValue;
  }

  async toRepresentation(
    data?: this["outType"],
    callbackIfDefined?: CallbackIfDefinedToRepresentation<I>
  ): Promise<this["outType"] | Array<this["outType"]> | undefined | null> {
    const isWriteOnly = this.writeOnly;
    if (isWriteOnly) return undefined;
    const sourceData = await this._getSource(data);
    const formattedData: this["type"] | null | undefined = await this._getDefaultValue(sourceData);
    const isDataNotNullNorUndefined = ![null, undefined].includes(formattedData);
    if (this.writeOnly) return undefined;
    if (callbackIfDefined && isDataNotNullNorUndefined) return callbackIfDefined(formattedData as Exclude<this["type"], null | undefined>);
    return data;
  }

  async validate(data: this["inType"]) {
    const isDataDefined = data !== undefined;
    const isDataNullAndDoesNotAllowNull = data === null && this.allowNull === false;
    const isRequiredAndNotReadOnly = this.required === true && this.readOnly === false;
    if (!isDataDefined && isRequiredAndNotReadOnly) await this.fail('required');
    if (isDataNullAndDoesNotAllowNull) await this.fail('null');
  }

  async toInternal(
    data?: this["inType"],
    callbackIfDefined?: CallbackIfDefinedToInternal<I>
  ): Promise<this["inType"] | Array<this["inType"]> | undefined | null> {
    const isDataNotNullNorUndefined = data !== null && data !== undefined;

    if (!isDataNotNullNorUndefined) return await this._getDefaultValue(data as undefined) as InFieldType<this["type"], RO>;
    else if (callbackIfDefined) return callbackIfDefined(data as Exclude<this["inType"], null | undefined>);
  }
}
