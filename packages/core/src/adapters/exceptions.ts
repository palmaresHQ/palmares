export class NotImplementedException extends Error {
    constructor(functionName: string) {
        super(`The ${functionName} was not implemented in the adapter and should be implemented.`);
    }
}