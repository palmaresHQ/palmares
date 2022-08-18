import log from "./logging";
import { LOGGING_NOT_FOUND_WARN_MESSAGE } from "./utils";
import ValidationError, { FieldSourcesError } from "./exceptions";
import { settings } from "./settings";
import { FieldErrorMessagesType, ErrorMessagesType, FieldParamsType } from "./types"

class Empty {}

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
export default class Field {
  private _fieldName: string;

  type!: any;
  context = {};
  source: string | undefined;
  required: boolean;
  defaultValue: any;
  allowNull: boolean;
  readOnly: boolean;
  writeOnly: boolean;
  errorMessages: {
    [key: string | symbol]: ErrorMessagesType;
  }
  #defaultErrorMessages: FieldErrorMessagesType = {
    required: 'This field is required.',
    null: 'The field cannot be null'
  }
  #defaultParams: FieldParamsType = {
    source: undefined,
    required: true,
    defaultValue: Empty,
    allowNull: false,
    readOnly: false,
    writeOnly: false,
    errorMessages: {}
  }

  constructor(params: FieldParamsType) {
    this._fieldName = '';
    this.errorMessages = {
      ...this.#defaultErrorMessages
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

  get fieldName() {
    return this._fieldName;
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
      throw new ValidationErrorClass(errorMessage);
    } else {
      log(LOGGING_NOT_FOUND_WARN_MESSAGE, { errorKey });
    }
  }

  protected async _getSource(instance: any): Promise<any> {
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

  protected async _getDefaultValue(data: this['type']) {
    const dataIsNotDefined = data === undefined;
    const defaultValueIsNotEmpty = this.defaultValue !== Empty;
    if (dataIsNotDefined && defaultValueIsNotEmpty) data = this.defaultValue;
    return data;
  }

  async toRepresentation(data?: any, ...args: any[]) {
    const isDataDefined = data !== undefined;
    const isRequiredAndNotWriteOnly = this.required && this.writeOnly === false;
    if (isDataDefined && isRequiredAndNotWriteOnly) await this.fail('required');
    return data;
  }

  async validate(data: any) {
    const isDataDefined = data !== undefined;
    const isDataNullAndDoesNotAllowNull = data === null && this.allowNull === false;
    const isRequiredAndNotReadOnly = this.required && this.readOnly === false;
    if (isDataDefined && isRequiredAndNotReadOnly) await this.fail('required');
    if (isDataNullAndDoesNotAllowNull) await this.fail('null');
  }

  async toInternal(data?: any, ...args: any[]) {
    await this.validate(data);
    return data;
  }
}

