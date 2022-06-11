export class ExistingMessageException extends Error {
    constructor(messageName: string) {
        super(`Message ${messageName} already exists, you might want to use a different name.`)
    }
}

export class MessageDoesNotExistException extends Error {
    constructor(messageName: string) {
        super(`Message ${messageName} does not exist.`)
    }
}