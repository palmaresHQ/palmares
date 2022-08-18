import log from "./logging";
import { LOGGING_NOT_FOUND_ERROR_MESSAGE } from "./utils";
import ValidationError, { FieldSourcesError } from "./exceptions";
import { settings } from "./settings";
import { FieldErrorMessagesType, ErrorMessagesType, FieldParamsType } from "./types"

class Empty {}

export default class Field {
  private _fieldName: string;

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
      log(LOGGING_NOT_FOUND_ERROR_MESSAGE, { errorKey });
    }
  }

  private async _getSource(instance: any): Promise<any> {
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
}
