export class InvalidDefaultValueForFieldType extends Error {
    constructor(fieldName: string, defaultValue: any, shouldBeOfType: string) {
        super(`Invalid default value for field ${fieldName}: ${defaultValue}\nShould be of type ${shouldBeOfType}`);
    }
}