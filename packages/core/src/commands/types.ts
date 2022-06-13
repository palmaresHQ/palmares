export type DefaultCommandTypes = 'dev' | 'build' | 'test' | 'start' | 'help' | 'makemigrations' | 'migrate';

export type DefaultCommandType = {
    [key: string]: {
        description: string;
        example: string;
        handler: (args: string[]) => Promise<void>;
    }
}