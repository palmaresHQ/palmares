import type Domain from './domain';
import AppServer from '../app';
import { SettingsType } from '../conf/types';

export type DomainReadyFunctionArgs<
  S = SettingsType,
  C extends object = object
> = {
  settings: S;
  domains: Domain[];
  app?: AppServer;
  customOptions: C;
};

export type DomainFunctionArguments = {
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
};
