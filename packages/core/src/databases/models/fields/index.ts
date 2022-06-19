import { FieldDefaultParamsType, DecimalFieldParamsType, CharFieldParamsType, TextFieldParamsType } from "./types";
import Engine from "../../engine";


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
    engineInstance!: Engine;
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