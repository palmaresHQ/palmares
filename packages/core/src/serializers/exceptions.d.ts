import { ValidationTypeExceptionParamsType } from "./types";
export declare class ValidationError extends Error {
    /**
     * We do not destructure the options here, this way you can send your own custom validations.
     * The structure here is only for internal use.
     */
    constructor(options: ValidationTypeExceptionParamsType);
}
export declare class InvalidSerializerError extends Error {
    constructor(errorKey: string);
}
export declare class InvalidSourceInSerializerError extends Error {
    constructor(source: string, attribute: string);
}
//# sourceMappingURL=exceptions.d.ts.map