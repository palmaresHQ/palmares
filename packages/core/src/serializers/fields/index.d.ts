import { SerializerErrorMessages, SerializerFieldParamsType, SerializerBooleanFieldParamsType, SerializerCharFieldParamsType, DefaultFieldType } from './types';
export declare class Field implements SerializerFieldParamsType<any> {
    #private;
    validate?(data: DefaultFieldType, ...args: any[]): Promise<void>;
    source?: string | null;
    required?: boolean;
    readOnly?: boolean;
    writeOnly?: boolean;
    defaultValue?: any;
    allowNull?: boolean;
    errorMessages?: SerializerErrorMessages;
    constructor(fieldParams?: SerializerFieldParamsType<DefaultFieldType>);
    /**
     * Throws a validation error that the data you are sending is invalid in some way.
     */
    fail(errorKey: string): Promise<void>;
    getSource(instance: DefaultFieldType): Promise<DefaultFieldType>;
    setDefaultValue(data: DefaultFieldType): Promise<DefaultFieldType>;
    toRepresentation(data: DefaultFieldType, ...args: any[]): Promise<any>;
    toInternal(data: DefaultFieldType, ...args: any[]): Promise<any>;
}
export declare class BooleanField extends Field implements SerializerFieldParamsType<boolean> {
    trueValues: any[];
    falseValues: any[];
    constructor({ trueValues, falseValues, ...rest }?: SerializerBooleanFieldParamsType);
    toRepresentation(data: boolean, ...args: any[]): Promise<boolean | null>;
    toInternal(data: boolean, ...args: any[]): Promise<boolean | null>;
}
export declare class CharField extends Field implements SerializerFieldParamsType<string> {
    allowBlank: boolean;
    maxLength: number | null;
    minLength: number | null;
    constructor({ allowBlank, maxLength, minLength, ...rest }?: SerializerCharFieldParamsType);
    /**
     * Validate if the data received is a string, if it is it passes, if not, it throws an error saying
     * that the data received is not valid.
     */
    validate(data: string, ...args: any[]): Promise<void>;
    toInternal(data: string, ...args: any[]): Promise<string | null>;
    toRepresentation(data: string, ...args: any[]): Promise<string | null>;
}
//# sourceMappingURL=index.d.ts.map