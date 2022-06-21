export type SerializerErrorMessages = {
    [key: string]: string;
}

export interface SerializerFieldParamsType<DefaultValue> {
    source?: string | null,
    required?: boolean,
    defaultValue?: DefaultValue | null | undefined,
    allowNull?: boolean,
    readOnly?: boolean,
    writeOnly?: boolean,
    errorMessages?: SerializerErrorMessages
}

export interface SerializerBooleanFieldParamsType extends SerializerFieldParamsType<boolean> {
    trueValues?: any[],
    falseValues?: any[]
}

export interface SerializerCharFieldParamsType extends SerializerFieldParamsType<string> {
    maxLength?: number | null,
    minLength?: number | null,
    allowBlank?: boolean
}

export type DefaultFieldType = any;