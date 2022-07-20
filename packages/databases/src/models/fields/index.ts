import { utils } from "@palmares/core";

import {
  ON_DELETE,
  ClassConstructor,
  FieldDefaultParamsType,
  DateFieldParamsType,
  DecimalFieldParamsType,
  CharFieldParamsType,
  TextFieldParamsType,
  ForeignKeyFieldParamsType,
  UUIDFieldParamsType,
} from "./types";
import Engine from "../../engine";
import Model from "../model";
import { ForeignKeyFieldRequiredParamsMissingError } from "./exceptions";

export { ON_DELETE as ON_DELETE };

export class Field<D = any, N extends boolean = boolean> {
  hasDefaultValue!: D extends undefined ? false : true;
  type!: any;
  primaryKey: boolean;
  defaultValue?: D;
  allowNull: N;
  unique: boolean;
  dbIndex: boolean;
  databaseName: string;
  underscored: boolean;
  typeName: string = Field.name;
  customAttributes: any | undefined | object | null;
  model!: Model;
  fieldName!: string;

  constructor({
    primaryKey=false,
    defaultValue=undefined,
    allowNull=false,
    unique=false,
    dbIndex=false,
    databaseName=null,
    underscored=true,
    customAttributes={}
  }: {
    defaultValue?: D;
    allowNull?: N extends true ? boolean: boolean;
  } & FieldDefaultParamsType = {}) {
    this.primaryKey = primaryKey;
    this.defaultValue = defaultValue;
    this.allowNull = allowNull as N;
    this.unique = unique;
    this.dbIndex = dbIndex;
    this.databaseName = databaseName || '';
    this.underscored = underscored;
    this.customAttributes = customAttributes;
  }

  async init(engineInstance: Engine, fieldName: string, model: Model) {
    const isUnderscored: boolean = (this.underscored || model.options.underscored) === true;
    this.fieldName = fieldName;
    this.model = model;

    if (isUnderscored) this.databaseName = utils.camelToSnakeCase(this.fieldName);
    else this.databaseName = this.fieldName;

    await engineInstance.fields.set(this as Field);
  }

  async toString(indentation: number = 0, customParams: string | undefined = undefined) {
    const ident = '  '.repeat(indentation);
    const fieldParamsIdent = '  '.repeat(indentation + 1);
    return `${ident}new models.fields.${this.constructor.name}({`+
      `${customParams ? `\n${customParams}` : ''}\n`+
      `${fieldParamsIdent}primaryKey: ${this.primaryKey},\n`+
      `${fieldParamsIdent}defaultValue: ${JSON.stringify(this.defaultValue)},\n`+
      `${fieldParamsIdent}allowNull: ${this.allowNull},\n`+
      `${fieldParamsIdent}unique: ${this.unique},\n` +
      `${fieldParamsIdent}dbIndex: ${this.dbIndex},\n` +
      `${fieldParamsIdent}databaseName: "${this.databaseName}",\n` +
      `${fieldParamsIdent}underscored: ${this.underscored},\n` +
      `${fieldParamsIdent}customAttributes: ${JSON.stringify(this.customAttributes)}\n` +
      `${ident}})`;
  }

  async compare(field: Field): Promise<boolean> {
    return true;
  }
}


/**
 * This is similar to an Integer Field except that it is the `id` of the database.
 * By default it is an auto-incrementing integer field, it is the primary key and it is unique.
 */
export class AutoField<
  D extends number = 1,
  N extends boolean = false
  > extends Field<D, N> {
  type!: number;
  typeName: string = AutoField.name;

  constructor({...rest}: {
    defaultValue?: D,
    allowNull?: N,
  } & FieldDefaultParamsType = {}) {
    super({...rest, primaryKey: true, allowNull: false, unique: true, dbIndex: true});
  }
}

/**
 * Same as the `AutoField` except that this is a big integer field so it accepts bigger numbers.
 * By default it is an auto-incrementing integer field, it is the primary key and it is unique.
 */
export class BigAutoField<
  D extends number = 1,
  N extends boolean = false
  > extends Field<D, N> {
  type!: number;
  typeName: string = BigAutoField.name;

  constructor({...rest}: {
    defaultValue?: D,
    allowNull?: N,
  } & FieldDefaultParamsType = {}) {
    super({...rest, primaryKey: true, allowNull: false, unique: true, dbIndex: true});
  }
}

export class IntegerField<
  D extends number | undefined = undefined,
  N extends boolean = false
  > extends Field<D, N> {
  type!: number;
  typeName: string = IntegerField.name;

  constructor(integerFieldParams: {
    defaultValue?: D;
    allowNull?: N;
  } & FieldDefaultParamsType = {}) {
    super({...integerFieldParams});
    const isDefaultValueDefined: boolean = typeof integerFieldParams.defaultValue === 'number' ||
      integerFieldParams.defaultValue === null;
    this.defaultValue = isDefaultValueDefined ? integerFieldParams.defaultValue: undefined;
  }
}

export class BigIntegerField<
  D extends number | undefined = undefined,
  N extends boolean = false
  > extends Field<D, N> {
  type!: number;
  typeName: string = BigIntegerField.name;

  constructor(bigIntegerFieldParams: {
    defaultValue?: D;
    allowNull?: N;
  } & FieldDefaultParamsType = {}) {
    super({...bigIntegerFieldParams});
    const isDefaultValueDefined: boolean = typeof bigIntegerFieldParams.defaultValue === 'number' ||
      bigIntegerFieldParams.defaultValue === null;
    this.defaultValue = isDefaultValueDefined ? bigIntegerFieldParams.defaultValue: undefined;
  }
}

export class DecimalField<
  D extends number | undefined = undefined,
  N extends boolean = false
  > extends Field<D, N> {
  type!: number
  typeName: string = DecimalField.name;
  maxDigits: number | null;
  decimalPlaces: number | null;

  constructor({ maxDigits=null, decimalPlaces=null, ...rest }: {
    defaultValue?: D;
    allowNull?: N;
  } & DecimalFieldParamsType = {}) {
    super({...rest});
    const isDefaultValueDefined: boolean = typeof rest.defaultValue === 'number' ||
      rest.defaultValue === null;
    this.defaultValue = isDefaultValueDefined ? rest.defaultValue: undefined;
    this.maxDigits = maxDigits;
    this.decimalPlaces = decimalPlaces;
  }

  async toString(indentation=0, _: string = '') {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(
      indentation,
      `${ident}maxDigits: ${this.maxDigits},\n`+
      `${ident}decimalPlaces: ${this.decimalPlaces}`
    );
  }
}
export class TextField<
  D extends string | undefined = undefined,
  N extends boolean = false
> extends Field<D, N> implements TextFieldParamsType {
  type!: string;
  typeName: string = TextField.name;
  allowBlank: boolean;

  constructor({
    allowBlank=true,
    ...rest
  }: {
    defaultValue?: D;
    allowNull?: N;
  } & TextFieldParamsType = {}) {
    super({...rest});
    const isDefaultValueDefined: boolean = rest.defaultValue === 'string' ||
      rest.defaultValue === null;
    this.defaultValue = isDefaultValueDefined ? rest.defaultValue: undefined;
    this.allowBlank = allowBlank;
  }

  async toString(indentation: number = 0, customParams: string | undefined = undefined) {
    const ident = '  '.repeat(indentation + 1);
    const customParamsString = customParams ? `\n${customParams}`: '';
    return super.toString(
      indentation,
      `${ident}allowBlank: ${this.allowBlank}` + customParamsString);
  }
}

export class CharField<
  D extends string | undefined = undefined,
  N extends boolean = false
  > extends TextField<D, N> implements CharFieldParamsType {
  hasDefaultValue!: D extends undefined ? false : true;
  type!: string;
  typeName: string = CharField.name;
  allowBlank: boolean;
  maxLength: number;

  constructor({
    maxLength=255,
    allowBlank=true,
    ...rest
  }: {
    defaultValue?: D;
    allowNull?: N;
  } & CharFieldParamsType = {} as any) {
    super({...rest});
    const defaultValueAsString = rest?.defaultValue as string;
    const isDefaultValueDefined: boolean = (
      defaultValueAsString === 'string' &&
      defaultValueAsString.length <= maxLength
    ) || defaultValueAsString === null;
    this.defaultValue = isDefaultValueDefined ? rest.defaultValue: undefined
    this.allowBlank = allowBlank;
    this.maxLength = maxLength;
  }

  async toString(indentation: number = 0, customParams: string | undefined = undefined) {
    const ident = '  '.repeat(indentation + 1);
    const customParamsString = customParams ? `\n${customParams}`: '';
    return super.toString(
      indentation,
      `${ident}maxLength: ${this.maxLength},\n`+
      `${ident}allowBlank: ${this.allowBlank}` +
      `${customParamsString}`
    );
  }
}

export class UUIDField<
  D extends string | undefined = undefined,
  N extends boolean = false
  > extends CharField<D, N> implements UUIDFieldParamsType {
  type!: string;
  typeName: string = UUIDField.name;
  autoGenerate: boolean;

  constructor({
    autoGenerate = false,
    maxLength = 36,
    ...rest
  } : {
    defaultValue?: D;
    allowNull?: N;
  } & UUIDFieldParamsType = {} as any) {
    super({ maxLength, defaultValue: (autoGenerate ? '' : rest.defaultValue) as D, ...rest });
    this.autoGenerate = autoGenerate;
  }

  async toString(indentation: number = 0, customParams: string | undefined = undefined) {
    const ident = '  '.repeat(indentation + 1);
    const customParamsString = customParams ? `\n${customParams}`: '';
    return super.toString(
      indentation,
      `${ident}autoGenerate: ${this.autoGenerate}${customParamsString}`
    );
  }
}

export class DateField<
  D extends string | Date | undefined = undefined,
  N extends boolean = false
  > extends Field<D, N> implements DateFieldParamsType {
  type!: Date;
  typeName: string = DateField.name;
  autoNow: boolean;
  autoNowAdd: boolean;

  constructor({autoNow=false, autoNowAdd=false, ...rest} : {
    defaultValue?: D;
    allowNull?: N;
  } & DateFieldParamsType ={}) {
      super({...rest})
      this.autoNow = autoNow
      this.autoNowAdd = autoNowAdd
  }

  async toString(indentation: number = 0, customParams: string | undefined = undefined) {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(
      indentation,
      `${ident}autoNow: ${this.autoNow},\n${ident}autoNowAdd: ${this.autoNowAdd}`
    );
  }
}

export class ForeignKeyField<
  M extends Model = Model,
  F extends string = any,
  D extends M["fields"][F]["type"] | undefined = undefined,
  N extends boolean = false
  > extends Field<D, N> {
  type!: M["fields"][F]["type"];
  typeName: string = ForeignKeyField.name;
  relatedTo!: string;
  onDelete!: ON_DELETE;
  customName?: string;
  relatedName?: string;
  toField: F;
  _originalRelatedName?: string;

  constructor({
    relatedTo,
    toField,
    onDelete,
    customName,
    relatedName,
    ...rest
  }: {
    relatedTo: ClassConstructor<M> | string;
    toField: F;
    defaultValue?: D;
    allowNull?: N,
  } & ForeignKeyFieldParamsType) {
    super(rest);

    let relatedToAsString: string = relatedTo as string;
    const isRelatedToNotAString: boolean = typeof relatedTo !== 'string';
    if (isRelatedToNotAString) {
      relatedToAsString = (relatedTo as ClassConstructor<Model>).name;
    }

    this.relatedTo = relatedToAsString;
    this.customName = customName;
    this.relatedName = relatedName;
    this.onDelete = onDelete;
    this.toField = toField;
  }

  async init(engineInstance: Engine, fieldName: string, model: Model): Promise<void> {
    const isRelatedToAndOnDeleteNotDefined = typeof this.relatedTo !== 'string' &&
      typeof this.onDelete !== 'string';

    if (isRelatedToAndOnDeleteNotDefined)
      throw new ForeignKeyFieldRequiredParamsMissingError(this.fieldName);

    // Appends to the model the other models this model is related to.
    model._dependentOnModels.push(this.relatedTo);

    await super.init(engineInstance, fieldName, model);
    const isFromAStateModel: boolean = this.model._isState;
    const wasRelatedNameDefined: boolean = typeof this.relatedName === 'string';
    if (isFromAStateModel && wasRelatedNameDefined) {
      this._originalRelatedName = this.relatedName;
      this.relatedName = `state${this._originalRelatedName}`;
    }
    if (wasRelatedNameDefined === false) {
      const relatedToWithFirstStringLower: string = this.relatedTo.charAt(0).toLowerCase() + this.relatedTo.slice(1);
      const modelWithFirstStringUpper: string = this.model.name.charAt(0).toUpperCase() + this.model.name.slice(1);
      const originalModelNameWithFirstStringUpper: string = this.model.originalName.charAt(0).toUpperCase() + this.model.originalName.slice(1);
      this.relatedName = `${relatedToWithFirstStringLower}${modelWithFirstStringUpper}s`;
      this._originalRelatedName = `${relatedToWithFirstStringLower}${originalModelNameWithFirstStringUpper}s`;
    }
  }

  async toString(indentation: number = 0, customParams: string | undefined = undefined) {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(
      indentation,
      `${ident}relatedTo: ${this.relatedTo},\n` +
      `${ident}toField: "${this.toField}"\n` +
      `${ident}onDelete: "${this.onDelete}"\n` +
      `${ident}customName: ${typeof this.customName === 'string' ? `"${this.customName}"` : this.customName}\n` +
      `${ident}relatedName: ${typeof this._originalRelatedName === 'string' ? `"${this._originalRelatedName}"` : this._originalRelatedName}`
    );
  }
}
