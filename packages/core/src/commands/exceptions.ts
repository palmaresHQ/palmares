export class CommandNotFoundException extends Error {
    constructor(commandName: string) {
        super(
            `Command ${commandName} not found, you can use "node manage.ts help" or "node manage.js help" ` + 
            `to see all commands available in the application.`
        );
    }
}