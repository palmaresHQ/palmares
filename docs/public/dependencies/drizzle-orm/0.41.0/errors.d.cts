import { entityKind } from "./entity.cjs";
export declare class DrizzleError extends Error {
    static readonly [entityKind]: string;
    constructor({ message, cause }: {
        message?: string;
        cause?: unknown;
    });
}
export declare class TransactionRollbackError extends DrizzleError {
    static readonly [entityKind]: string;
    constructor();
}
