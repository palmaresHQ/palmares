import { DatabaseConfigurationType } from "../types";

export default class Engine {
    constructor(databaseName: string, databaseSettings: DatabaseConfigurationType) {}

    async isConnected(): Promise<boolean> {
        return false;
    }
}