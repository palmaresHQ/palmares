import { 
    SerializerErrorMessages, 
    SerializerFieldParamsType, 
    SerializerBooleanFieldParamsType,
    SerializerCharFieldParamsType,
    DefaultFieldType 
} from './types';
import { 
    InvalidSerializerError, 
    InvalidSourceInSerializerError, 
    ValidationError 
} from '../exceptions';

export class Field implements SerializerFieldParamsType<any> {
  validate?(data: DefaultFieldType, ...args: any[]): Promise<void>; 
  source?: string | null;
  required?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  defaultValue?: any;
  allowNull?: boolean;
  errorMessages?: SerializerErrorMessages;
    
  #fieldName: string;
  #defaultErrorMessages = {
    required: 'This field is required.',
    null: 'This field cannot be null.'
  };

  constructor(fieldParams: SerializerFieldParamsType<DefaultFieldType> = {
    source: null, required: true, defaultValue: undefined, allowNull: false,
    readOnly: false, writeOnly: false, errorMessages: {}
  }) {
    this.errorMessages = {
      ...this.#defaultErrorMessages,
      ...fieldParams.errorMessages
    }
    this.#fieldName = '';
    this.source = fieldParams.source;
    this.required = fieldParams.required;
    this.defaultValue = fieldParams.defaultValue;
    this.allowNull = fieldParams.allowNull;
    this.readOnly = fieldParams.readOnly;
    this.writeOnly = fieldParams.writeOnly;
  }

  /**
   * Throws a validation error that the data you are sending is invalid in some way.
   */
  async fail(errorKey: string): Promise<void> {
    const errorMessages = this.errorMessages || {};
    const hasErrorMessageForKey = typeof errorMessages[errorKey] === 'string';
    if (hasErrorMessageForKey) {
      throw new ValidationError({
        fieldName: this.#fieldName, 
        errorKey: errorKey, 
        reason: errorMessages[errorKey]
      });
      } else {
        throw new InvalidSerializerError(errorKey);
      }
    }

  async getSource(instance: DefaultFieldType): Promise<DefaultFieldType> {
    let newInstance = {...instance}
    const isSourceDefinedAndIsNotWriteOnly = typeof this.source === 'string' && 
      this.writeOnly === false;
    if (isSourceDefinedAndIsNotWriteOnly) {
      const isSourceAWildCard = this.source === '*';
      if (isSourceAWildCard) {
        return instance;
      } else {
        const source: string = this.source || '';
        const attributes: string[] = source.split('.');
        for (const attribute of attributes) {
          const doesAttributeExistInFieldInstance: boolean = Object.keys(
            newInstance
          ).includes(
            attribute
          );
          if (doesAttributeExistInFieldInstance) {
            newInstance = newInstance[attribute];
          } else {
            throw new InvalidSourceInSerializerError(source, attribute);
          }
        }
        return newInstance;
      }
    }
    return instance;
  }

  async setDefaultValue(data: DefaultFieldType): Promise<DefaultFieldType>{
    const isDefaultValue = data === undefined && this.defaultValue !== undefined;
    if (isDefaultValue) data = this.defaultValue;
    return data;
  }
  
  async toRepresentation(data: DefaultFieldType, ...args: any[]): Promise<any> {
    const isDataUndefinedWhileFieldIsRequired = data === undefined && 
        this.required && this.writeOnly === false;
    if (isDataUndefinedWhileFieldIsRequired) await this.fail('required');
    return data;
  }

  async toInternal(data: DefaultFieldType, ...args: any[]): Promise<any> {
    const isDataNotDefined = data === undefined;
    const isDataNull = data === null;
    const isARequiredFieldAndNotReadOnly = this.required && this.readOnly === false;
    const doesFieldAllowNull = this.allowNull === true;
    
    if (isDataNotDefined && isARequiredFieldAndNotReadOnly) this.fail('required')
    if (isDataNotDefined && this.required) this.fail('required')
    if (isDataNull && !doesFieldAllowNull) this.fail('null')
    if (typeof this.validate === 'function') await this.validate(data, ...args)
    return data
  }
}

export class BooleanField extends Field implements SerializerFieldParamsType<boolean> {
  trueValues: any[];
  falseValues: any[];

  constructor({trueValues, falseValues, ...rest}: SerializerBooleanFieldParamsType = {
    trueValues: [true, 'true', 'True', 1],
    falseValues: [false, 'False','false', 0]
  }) {
    rest.errorMessages = {
      invalid: 'This field must be a boolean.',
      ...rest.errorMessages
    }
    super(rest);
    this.trueValues = trueValues || [];
    this.falseValues = falseValues || [];
  }

  async toRepresentation(data: boolean, ...args: any[]): Promise<boolean | null> {
    const value = await super.toRepresentation(data, ...args);
    if (this.trueValues.includes(value)) return true;
    if (this.falseValues.includes(value)) return false;
    if (value === null || value === undefined) return null;
    return value === 'true';
  }
    
  async toInternal(data: boolean, ...args: any[]): Promise<boolean | null> {
    const value = await super.toInternal(data, ...args);
    if (this.trueValues.includes(value)) return true;
    if (this.falseValues.includes(value)) return false;
    if ((value === null || value === undefined) && this.allowNull) return null;
    
    await this.fail('invalid');
    return null;
  }
}

export class CharField extends Field implements SerializerFieldParamsType<string>  {
  allowBlank: boolean;
  maxLength: number | null;
  minLength: number | null;

  constructor({allowBlank, maxLength, minLength, ...rest}: SerializerCharFieldParamsType = {
    allowBlank: false,
    maxLength: null,
    minLength: null
  }) {
    rest.errorMessages = {
      invalid: 'Not a valid string',
      maxLength: `Make sure this field is not logger than ${maxLength} character(s) long.`,
      minLength: `Make sure this field is at least ${minLength} character(s) long.`,
      blank: 'The field cannot be blank',
      ...rest.errorMessages
    }
    super(rest);
    this.allowBlank = allowBlank || false;
    this.maxLength = maxLength || null;
    this.minLength = minLength || null;
  }

  /**
   * Validate if the data received is a string, if it is it passes, if not, it throws an error saying 
   * that the data received is not valid.
   */
  async validate(data: string, ...args: any[]): Promise<void> {
    if (data === null) return;
    if (typeof data !== 'string') this.fail('invalid')
    if (this.maxLength && data.length > this.maxLength) this.fail('maxLength')
    if (this.minLength && data.length < this.minLength) this.fail('maxLength')
    if (this.allowBlank === false && data === '') this.fail('blank')
  }
    
  async toInternal(data: string, ...args: any[]): Promise<string | null> {
    const value = await super.toInternal(data, ...args);
    if (value === null) return null;
    return value.toString();
  }

  async toRepresentation(data: string, ...args: any[]): Promise<string | null> {
    const value = await super.toRepresentation(data, ...args);
    const isValueNullOrUndefined = value === null || value === undefined;
    if (isValueNullOrUndefined) return data.toString();
    return data;
  }
}
