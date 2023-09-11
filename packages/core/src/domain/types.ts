import type Domain from './domain';
import { AppServer, appServer } from '../app';
import { SettingsType } from '../conf/types';

export type DomainReadyFunctionArgs<S = SettingsType, C extends object = object> = {
  settings: S;
  domains: Domain[];
  app?: AppServer | InstanceType<ReturnType<typeof appServer>>;
  customOptions: C;
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
