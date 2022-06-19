export class NotImplementedEngineException extends Error {
    constructor(methodName: string) {
        super(`Method ${methodName} was not implemented in your engine, it should be in order to fully work.`);
    }
}