import { SettingsType } from '@palmares/core';
import ValidationError from './exceptions';
import Schema from './schema';

export type SerializersSettingsType = SettingsType & {
  SERIALIZER_SCHEMA?: typeof Schema;
  ERROR_CLASS?: typeof ValidationError;
  ERROR_MESSAGES?: {
    [key: string]: ErrorMessagesType;
  };
};

export type ErrorMessagesType = string | (() => string | Promise<string>);

export type This<T extends new (...args: any) => any> = {
  new (...args: ConstructorParameters<T>): any;
} & Pick<T, keyof T>;
