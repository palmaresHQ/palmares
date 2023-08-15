import { SettingsType } from '../conf/types';
import { DomainReadyFunctionArgs } from './types';
import Domain from './domain';
import { DefaultCommandType } from '../commands/types';

type ExtractModifierArguments<
  TModifiers extends readonly (abstract new (...args: any) => {
    modifiers: any;
  })[],
  TFinalArgs = unknown
> = TModifiers extends readonly [infer TFirstModifier, ...infer TRestModifiers]
  ? TFirstModifier extends abstract new (...args: any) => {
      modifiers: infer TModifierArgs;
    }
    ? ExtractModifierArguments<
        TRestModifiers extends readonly (abstract new (...args: any) => {
          modifiers: any;
        })[]
          ? TRestModifiers
          : [],
        TFinalArgs & TModifierArgs
      >
    : never
  : TFinalArgs;

export default function domain<
  TModifierArguments extends object = object,
  TModifiers extends readonly (abstract new (...args: any) => {
    modifiers: any;
  })[] = []
>(
  name: string,
  path: string,
  args: {
    modifiers?: TModifiers;
    commands?: DefaultCommandType;
    load?: <TSettings extends SettingsType = SettingsType>(
      settings: TSettings
    ) => void | Promise<void>;
    ready?: <
      TSettings extends SettingsType = SettingsType,
      TCustomOptions extends object = object
    >(
      args: DomainReadyFunctionArgs<TSettings, TCustomOptions>
    ) => void | Promise<void>;
    close?: () => void | Promise<void>;
  } & ExtractModifierArguments<TModifiers> &
    TModifierArguments
) {
  class ReturnedClass extends Domain<TModifierArguments> {
    name = name;
    path = path;

    commands = args.commands || {};
    load = args.load;
    ready = args.ready;
    close = args.close;
  }
  /*for (const [modifierArgKey, modifiedArg] of Object.entries(
    modifierArguments || {}
  )) {
    (ReturnedClass.prototype as any)[modifierArgKey] = modifiedArg;
  }*/

  return ReturnedClass;
}

const databaseDomain = domain<{
  getModels: () => Promise<any>;
  getMigrations: () => Promise<any>;
}>('@palmares/database', __dirname, {});

const testDomain = domain('test', __dirname, {
  modifiers: [databaseDomain] as const,
});
