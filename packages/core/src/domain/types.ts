import type Domain from './domain';
import type { AppServer, appServer } from '../app';
import type { SettingsType } from '../conf/types';


export type DomainReadyFunctionArgs<TSettings = SettingsType, TCustom extends object = object> = {
  settings: TSettings;
  domains: Domain[];
  app?: AppServer | InstanceType<ReturnType<typeof appServer>>;
  customOptions: TCustom;
};

export type ExtractModifierArguments<
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
