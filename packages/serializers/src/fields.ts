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

  async fail(errorKey: string) {
    if (errorKey in this.errorMessages) {
      const message = this.errorMessages[errorKey];
      const isErrorMessageAFunction = typeof message === 'function';
      const errorMessage = isErrorMessageAFunction ? await Promise.resolve(message()) : message;
      throw new Error(errorMessage);
    }
  }


}
