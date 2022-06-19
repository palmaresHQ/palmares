export interface FieldDefaultParamsType {
    primaryKey?: boolean;
    defaultValue?: string | number | boolean | null | undefined | Date, 
    allowNull?: boolean,
    unique?: boolean, 
    allowBlank?: boolean,
    dbIndex?: boolean, 
    underscored?: boolean, 
    databaseName?: string | null, 
    customAttributes?: any | undefined | object | null
};

export type DecimalFieldParamsType = {
    maxDigits?: number | null,
    decimalPlaces?: number | null
};

export interface TextFieldParamsType {
    allowBlank?: boolean,
};

export interface CharFieldParamsType {
    maxLength?: number,
};
