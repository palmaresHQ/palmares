import { FieldDefaultParamsType } from "./fields/types";
import Engine from "../engine";

export const ON_DELETE = {
  CASCADE: 'cascade',
  SET_NULL: 'set_null',
  SET_DEFAULT: 'set_default',
  DO_NOTHING: 'do_nothing',
  RESTRICT: 'restrict'
}

export class Field implements FieldDefaultParamsType {
  primaryKey: boolean;
  defaultValue: string | number | boolean | null | undefined | Date;
  allowNull: boolean;
  unique: boolean;
  allowBlank: boolean;
  dbIndex: boolean;
  databaseName: string | null;
  underscored: boolean;
  customAttributes: any | undefined | object | null;
  fieldName!: string;

  constructor({
    primaryKey=false, 
    defaultValue=undefined, 
    allowNull=false, 
    unique=false, 
    allowBlank=true,
    dbIndex=false, 
    databaseName=null, 
    underscored=true, 
    customAttributes={}
  }: FieldDefaultParamsType = {}) {
    this.primaryKey = primaryKey;
    this.defaultValue = defaultValue;
    this.allowNull = allowNull;
    this.unique = unique;
    this.allowBlank = allowBlank;
    this.dbIndex = dbIndex;
    this.databaseName = databaseName;
    this.underscored = underscored;
    this.customAttributes = customAttributes;
  }

  async init(engineInstance: Engine, fieldName: string) {
    this.fieldName = fieldName;
    await engineInstance.fields.set(this);
  }
}

export class AutoField extends Field {
  constructor({...rest} : FieldDefaultParamsType = {}) {
    super({...rest, primaryKey: true, allowNull: false, unique: true, dbIndex: true});
  }
}

export class BigAutoField extends Field {
  constructor({...rest} : FieldDefaultParamsType = {}) {
    super({...rest, primaryKey: true, allowNull: false, unique: true, dbIndex: true});
  }
}

export class IntegerField extends Field {
  constructor(integerFieldParams: FieldDefaultParamsType = {}) {
    const isDefaultValueDefined: boolean = integerFieldParams.defaultValue !== undefined &&
      integerFieldParams.defaultValue !== null; 
    if (isDefaultValueDefined) {
      const isDefaultValueANumber: boolean = typeof integerFieldParams.defaultValue === 'number';
      if (!isDefaultValueANumber) {
        throw new Error('Default value for IntegerField must be a number');
      }
    }
    super({...integerFieldParams, defaultValue: isDefaultValueDefined ? integerFieldParams.defaultValue : 0});
  }
}
