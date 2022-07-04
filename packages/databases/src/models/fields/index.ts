import { utils } from "@palmares/core";

import {
  ON_DELETE,
  FieldDefaultParamsType,
  DateFieldParamsType,
  DecimalFieldParamsType,
  CharFieldParamsType,
  TextFieldParamsType,
  ForeignKeyFieldParamsType,
  UUIDFieldParamsType
} from "./types";
import Engine from "../../engine";
import Model from "../model";
import { ForeignKeyFieldRequiredParamsMissingError } from "./exceptions";

export { ON_DELETE as ON_DELETE };

export class Field implements FieldDefaultParamsType {
  primaryKey: boolean;
  defaultValue: string | number | boolean | null | undefined | Date;
  allowNull: boolean;
  unique: boolean;
  dbIndex: boolean;
  databaseName: string | null;
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
  }: FieldDefaultParamsType = {}) {
    this.primaryKey = primaryKey;
    this.defaultValue = defaultValue;
    this.allowNull = allowNull;
    this.unique = unique;
    this.dbIndex = dbIndex;
    this.databaseName = databaseName;
    this.underscored = underscored;
    this.customAttributes = customAttributes;
  }

  async init(engineInstance: Engine, fieldName: string, model: Model) {
    const isUnderscored: boolean = (this.underscored || model.options.underscored) === true;
    this.fieldName = fieldName;
    this.model = model;

    if (isUnderscored) this.databaseName = utils.camelToSnakeCase(this.fieldName);
    else this.databaseName = this.fieldName;

    await engineInstance.fields.set(this);
  }
}
/**
 * This is similar to an Integer Field except that it is the `id` of the database.
 * By default it is an auto-incrementing integer field, it is the primary key and it is unique.
 */
export class AutoField extends Field {
  typeName: string = AutoField.name;

  constructor({...rest} : FieldDefaultParamsType = {}) {
    super({...rest, allowNull: false, unique: true, dbIndex: true});
  }
}

/**
 * Same as the `AutoField` except that this is a big integer field so it accepts bigger numbers.
 * By default it is an auto-incrementing integer field, it is the primary key and it is unique.
 */
export class BigAutoField extends Field {
  typeName: string = BigAutoField.name;

  constructor({...rest} : FieldDefaultParamsType = {}) {
    super({...rest, allowNull: false, unique: true, dbIndex: true});
  }
}

export class IntegerField extends Field {
  typeName: string = IntegerField.name;

  constructor(integerFieldParams: FieldDefaultParamsType = {}) {
    const isDefaultValueDefined: boolean = integerFieldParams.defaultValue === 'number' ||
      integerFieldParams.defaultValue === null;
    super({
      ...integerFieldParams,
      defaultValue: isDefaultValueDefined ? integerFieldParams.defaultValue: undefined
    });
  }
}

export class BigIntegerField extends Field {
  typeName: string = BigIntegerField.name;

  constructor(bigIntegerFieldParams: FieldDefaultParamsType = {}) {
    const isDefaultValueDefined: boolean = bigIntegerFieldParams.defaultValue === 'number' ||
      bigIntegerFieldParams.defaultValue === null;
    super({
      ...bigIntegerFieldParams,
      defaultValue: isDefaultValueDefined ? bigIntegerFieldParams.defaultValue: undefined
    });
  }
}

export class DecimalField extends Field {
  typeName: string = DecimalField.name;
  maxDigits: number | null;
  decimalPlaces: number | null;

  constructor({ maxDigits=null, decimalPlaces=null, ...rest }: FieldDefaultParamsType & DecimalFieldParamsType = {}) {
    const isDefaultValueDefined: boolean = rest.defaultValue === 'number' ||
      rest.defaultValue === null;
    super({
      ...rest,
      defaultValue: isDefaultValueDefined ? rest.defaultValue: undefined
    });
    this.maxDigits = maxDigits;
    this.decimalPlaces = decimalPlaces;
  }
}

export class CharField extends Field implements CharFieldParamsType {
  typeName: string = CharField.name;
  allowBlank: boolean;
  maxLength: number;

  constructor({
    maxLength,
    allowBlank=true,
    ...rest
  }: CharFieldParamsType = {
    maxLength: 255
  }) {
    const isDefaultValueDefined: boolean = (
      rest.defaultValue === 'string' &&
      rest.defaultValue.length <= maxLength
    ) || rest.defaultValue === null;

    super({
      ...rest,
      defaultValue: isDefaultValueDefined ? rest.defaultValue: undefined
    });
    this.allowBlank = allowBlank;
    this.maxLength = maxLength;
  }
}

export class TextField extends Field implements TextFieldParamsType {
  typeName: string = TextField.name;
  allowBlank: boolean;

  constructor({
    allowBlank=true,
    ...rest
  }: TextFieldParamsType = {}) {
    const isDefaultValueDefined: boolean = rest.defaultValue === 'string' ||
      rest.defaultValue === null;
    super({
      ...rest,
      defaultValue: isDefaultValueDefined ? rest.defaultValue: undefined
    });
    this.allowBlank = allowBlank;
  }
}

export class UUIDField extends CharField implements UUIDFieldParamsType {
  typeName: string = UUIDField.name;
  autoGenerate: boolean;

  constructor({
    autoGenerate = false, ...rest
  } : UUIDFieldParamsType = {
    maxLength: 36
  }) {
    const defaultValue = autoGenerate ? undefined : rest.defaultValue;

    super({...rest, defaultValue: defaultValue});
    this.autoGenerate = autoGenerate;
  }
}

export class DateField extends Field implements DateFieldParamsType {
  typeName: string = DateField.name;
  autoNow: boolean;
  autoNowAdd: boolean;

  constructor({autoNow=false, autoNowAdd=false, ...rest} ={}) {
      super({...rest})
      this.autoNow = autoNow
      this.autoNowAdd = autoNowAdd
  }
}
export class ForeignKeyField extends Field implements ForeignKeyFieldParamsType {
  typeName: string = ForeignKeyField.name;
  relatedTo!: string;
  onDelete!: ON_DELETE;
  customName?: string;
  relatedName?: string;
  toField?: string;

  constructor({
    relatedTo,
    onDelete,
    customName,
    relatedName,
    toField,
    ...rest
  }: ForeignKeyFieldParamsType = {
    relatedTo: '',
    onDelete: ON_DELETE.CASCADE
  }) {
    super(rest);

    let relatedToAsString: string = relatedTo as string;
    const isRelatedToAModel: boolean = typeof relatedTo === 'function' &&
      (relatedTo as Model).prototype instanceof Model;
    if (isRelatedToAModel) {
      relatedToAsString = (relatedTo as Model).name;
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

    if (isRelatedToAndOnDeleteNotDefined) {
      throw new ForeignKeyFieldRequiredParamsMissingError(this.fieldName);
    }

    await super.init(engineInstance, fieldName, model);

    const wasRelatedNameDefined: boolean = typeof this.relatedName === 'string';
    const relatedToWithFirstStringLower: string = this.relatedTo.charAt(0).toLowerCase() + this.relatedTo.slice(1);
    const modelWithFirstStringUpper: string = this.model.name.charAt(0).toUpperCase() + this.model.name.slice(1);
    this.relatedName = wasRelatedNameDefined ? this.relatedName as string :
      `${relatedToWithFirstStringLower}${modelWithFirstStringUpper}s`;
  }
}
