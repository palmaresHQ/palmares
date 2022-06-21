import { ValidationTypeExceptionParamsType } from "./types";


export class ValidationError extends Error {
    /**
     * We do not destructure the options here, this way you can send your own custom validations.
     * The structure here is only for internal use.
     */
    constructor(options: ValidationTypeExceptionParamsType) {
        super(JSON.stringify(options));
    }
}

export class InvalidSerializerError extends Error {
    constructor(errorKey: string) {
        super(
            `Error ${errorKey} was not defined. Please define as:` + 
            `\nerrorMessage={\n  ${errorKey}: "Your custom error message"\n}`
        );
    }
}


export class InvalidSourceInSerializerError extends Error {
    constructor(source: string, attribute: string) {
        super(`The source '${source}' is invalid because we could not find '${attribute}' in the object passed.`);
    }
}