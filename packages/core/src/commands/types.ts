import { SettingsType } from '../conf/types';
import Domain from '../domain';

export type DefaultCommandTypes =
  | 'dev'
  | 'build'
  | 'test'
  | 'start'
  | 'help'
  | 'makemigrations'
  | 'migrate';

export type DomainHandlerFunctionArgs = {
  settings: SettingsType;
  domains: Domain[];
  args: {
    positionalArgs: string[];
    keywordArgs: {
      [key: string]: any;
    };
  };
};

export type DefaultCommandType = {
  [key: string]: {
    description: string;
    example: string;
    handler: (options: DomainHandlerFunctionArgs) => Promise<void> | void;
  };
};
