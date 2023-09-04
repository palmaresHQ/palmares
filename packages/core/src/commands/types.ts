import AppServer from '../app';
import type { SettingsType2 } from '../conf/types';
import type domain from '../domain/function';
import type Domain from '../domain/domain';
import type { Narrow } from '../utils';

type ExtractTypeFromArg<
  TArgument extends
    | NonNullable<NonNullable<Domain['commands']>[string]['keywordArgs']>[string]
    | NonNullable<NonNullable<Domain['commands']>[string]['positionalArgs']>[string],
  TPositionalOrKeyword extends 'positionalArgs' | 'keywordArgs'
> = TArgument['type'] extends 'string'
  ? TArgument['canBeMultiple'] extends true
    ? string[]
    : string
  : TArgument extends 'number'
  ? TArgument['canBeMultiple'] extends true
    ? number[]
    : number
  : TArgument extends 'boolean'
  ? TArgument['canBeMultiple'] extends true
    ? boolean[]
    : boolean
  : TArgument extends string[] | readonly string[]
  ? TArgument['canBeMultiple'] extends true
    ? Narrow<TArgument>
    : Narrow<TArgument>
  : TPositionalOrKeyword extends 'positionalArgs'
  ? TArgument['canBeMultiple'] extends true
    ? string[]
    : string
  : TArgument['canBeMultiple'] extends true
  ? boolean[]
  : boolean;

/**
 * Used for extracting the type of the arguments of a command of a specific domain for a specific command.
 */
export type ExtractCommandsType<
  TDomain extends typeof Domain | ReturnType<typeof domain>,
  TCommand extends keyof NonNullable<InstanceType<TDomain>['commands']>
> = {
  keywordArgs: {
    [Key in keyof NonNullable<InstanceType<TDomain>['commands']>[TCommand]['keywordArgs']]?: ExtractTypeFromArg<
      NonNullable<NonNullable<InstanceType<TDomain>['commands']>[TCommand]['keywordArgs']>[Key],
      'keywordArgs'
    >;
  };
  positionalArgs: {
    [Key in keyof NonNullable<InstanceType<TDomain>['commands']>[TCommand]['positionalArgs']]: ExtractTypeFromArg<
      NonNullable<NonNullable<InstanceType<TDomain>['commands']>[TCommand]['positionalArgs']>[Key],
      'positionalArgs'
    >;
  };
};

export type DomainHandlerFunctionArgs = {
  settings: SettingsType2;
  domains: Domain[];
  args: {
    positionalArgs: {
      [key: string]: any;
    };
    keywordArgs: {
      [key: string]: any;
    };
  };
};

export type DefaultCommandType = {
  [key: string]: {
    /**
     * The description of the command, try to explain in a few words what the command does and what it is used for.
     */
    description: string;
    /**
     * The positional arguments that the command accepts.
     */
    positionalArgs:
      | {
          [key: string]: {
            /**
             * The description of the argument, try to explain in a few words what the argument does and what it is used for.
             */
            description: string;
            /**
             * If the argument is required or not. If you don't specify it, it will default to true.
             *
             * @default true
             */
            required?: boolean;
            /**
             * If can be multiple is set to true, you can use the argument multiple times. If you don't specify it, it will default to false.
             *
             * @default false
             */
            canBeMultiple?: boolean;
            /**
             * The type of the argument. If you don't specify it, it will default to a string.
             *
             * @default 'string'
             */
            type?: 'string' | 'number' | 'boolean';
          };
        }
      | undefined;
    keywordArgs:
      | {
          [key: string]: {
            /**
             * The description of the argument, try to explain in a few words what the argument does and what it is used for.
             */
            description: string;
            /**
             * Let's say you have an argument called `--name` and you want to be able to use `-n` instead of `--name`, you can set `hasFlag` to true and it will take the `n` and use it as acronym.
             * If you have for example `--name` and `--number` and you set `hasFlag` for both of them, it will not work as expected, it will just work for the first one. If `name` comes before `number` in the command,
             * it will work for `name`, if `number` comes before `name` in the command, it will work for `number`. If you don't specify it, it will default to false.
             *
             * @default false.
             */
            hasFlag?: boolean;
            /**
             * If can be multiple is set to true, you can use the argument multiple times. If you don't specify it, it will default to false.
             *
             * @default false
             */
            canBeMultiple?: boolean;
            /**
             * A default value for the argument. If you don't specify it, it will default to undefined.
             *
             * @default undefined
             */
            default?: any;
            /**
             * The type of the argument. If an array of string is provided, this will be all of the choices that the user can define. If you don't specify it, it will default to 'boolean'.
             *
             * @default 'boolean'
             */
            type?: 'string' | 'number' | 'boolean' | readonly string[] | string[];
          };
        }
      | undefined;
    /**
     * This is the function that will be called when the command is executed.
     *
     * ADVANCED:
     * If you return an AppServer from this function, we will initialize it. If you don't know what an AppServer is, don't worry about it.
     */
    handler: (options: DomainHandlerFunctionArgs) => Promise<void | AppServer> | (void | AppServer);
  };
};
