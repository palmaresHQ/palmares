export class AdapterNotFoundException extends Error {
    constructor(adapter: string) {
        super(`Adapter ${adapter} could not be found`);
    }
}