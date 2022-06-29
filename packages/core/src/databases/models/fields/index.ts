import { 
  ON_DELETE, 
  FieldDefaultParamsType, 
  DateFieldParamsType,
  DecimalFieldParamsType, 
  CharFieldParamsType, 
  TextFieldParamsType,
  ForeignKeyFieldParamsType
} from "./types";
import Engine from "../../engine";
import Model from "../model";
import { ForeignKeyFieldRequiredParamsMissingError } from "./exceptions";

export { ON_DELETE as ON_DELETE };

export class Field implements FieldDefaultParamsType, DateFieldParamsType, ForeignKeyFieldParamsType {
  primaryKey: boolean;
  defaultValue: string | number | boolean | null | undefined | Date;
  allowNull: boolean;
  unique: boolean;
  dbIndex: boolean;
  databaseName: string | null;
  underscored: boolean;
  customAttributes: any | undefined | object | null;
  model!: Model;
  fieldName!: string;
  autoNow?: boolean;
  autoNowAdd?: boolean;
  relatedTo!: Model | string | null;
  onDelete!: ON_DELETE | null;
  customName?: string;
  relatedName?: boolean;
  toField?: string;
  
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
    this.fieldName = fieldName;
    this.model = model;
    await engineInstance.fields.set(this);
  }
}
/**
 * This is similar to an Integer Field except that it is the `id` of the database.
 * By default it is an auto-incrementing integer field, it is the primary key and it is unique.
 */
export class AutoField extends Field {
  constructor({...rest} : FieldDefaultParamsType = {}) {
    super({...rest, primaryKey: true, allowNull: false, unique: true, dbIndex: true});
  }
}

/**
 * Same as the `AutoField` except that this is a big integer field so it accepts bigger numbers.
 * By default it is an auto-incrementing integer field, it is the primary key and it is unique.
 */
export class BigAutoField extends Field {
  constructor({...rest} : FieldDefaultParamsType = {}) {
    super({...rest, primaryKey: true, allowNull: false, unique: true, dbIndex: true});
  }
}

export class IntegerField extends Field {
    constructor(integerFieldParams: FieldDefaultParamsType = {}) {
        const isDefaultValueDefined: boolean = integerFieldParams.defaultValue === 'number' || 
            integerFieldParams.defaultValue === null; 
        /*if (isDefaultValueDefined) {
            const isDefaultValueANumber: boolean = typeof integerFieldParams.defaultValue === 'number';
            if (!isDefaultValueANumber) {
                throw new InvalidDefaultValueForFieldType(, );
            }
        }*/
        super({
            ...integerFieldParams, 
            defaultValue: isDefaultValueDefined ? integerFieldParams.defaultValue: undefined
        });
    }
}

export class BigIntegerField extends Field {
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

export class CharField extends Field {
    allowBlank: boolean;
    maxLength: number;

    constructor({ 
        maxLength=255, 
        allowBlank=true, 
        ...rest 
    }: FieldDefaultParamsType & CharFieldParamsType & TextFieldParamsType = {}) {
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

export class TextField extends Field {
    allowBlank: boolean;
    constructor({ allowBlank=true, ...rest }: FieldDefaultParamsType & TextFieldParamsType = {}) {
        const isDefaultValueDefined: boolean = rest.defaultValue === 'string' || 
            rest.defaultValue === null;
        super({
            ...rest, 
            defaultValue: isDefaultValueDefined ? rest.defaultValue: undefined
        });
        this.allowBlank = allowBlank;
    }
}

export class ForeignKeyField extends Field implements ForeignKeyFieldParamsType {
  relatedTo!: Model | string | null;
  onDelete!: ON_DELETE | null;
  customName?: string;
  relatedName?: boolean;
  toField?: string;

  constructor({ 
    relatedTo,
    onDelete,
    customName,
    relatedName,
    toField,
    ...rest
  }: ForeignKeyFieldParamsType & FieldDefaultParamsType = { 
    relatedTo: null, 
    onDelete: ON_DELETE.CASCADE
  }) {
    super(rest);  
    this.relatedTo = relatedTo;
    this.customName = customName;
    this.relatedName = relatedName;
    this.onDelete = onDelete;
    this.toField = toField;
  }

  async init(engineInstance: Engine, fieldName: string, model: Model): Promise<void> {
    const isRelatedToAModel: boolean = this.relatedTo instanceof Function && 
      Object.getPrototypeOf(this.relatedTo).name === 'Model';
    const isRelatedToAndOnDeleteNotDefined = (typeof this.relatedTo !== 'string' || isRelatedToAModel) && 
      typeof this.onDelete !== 'string';

    if (isRelatedToAndOnDeleteNotDefined) {
      throw new ForeignKeyFieldRequiredParamsMissingError(this.fieldName);
    }

    if (isRelatedToAModel) {
      const relatedToAsAModel: Model = this.relatedTo as Model;
      this.relatedTo = relatedToAsAModel.name;
    }

    await super.init(engineInstance, fieldName, model);
  }
}