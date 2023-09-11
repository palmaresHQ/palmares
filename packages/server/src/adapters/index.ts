import { Domain } from '@palmares/core';
import { ServerSettingsType } from '../types';
import ServerRequestAdapter from './requests';
import ServerResponseAdapter from './response';

/**
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverAdapter<
  TLoadFunction extends ServerAdapter['load'],
  TLoad404Function extends ServerAdapter['load404'],
  TLoad500Function extends ServerAdapter['load500'],
  TStartFunction extends ServerAdapter['start'],
  TCloseFunction extends ServerAdapter['close']
>(args: {
  load: TLoadFunction;
  load404: TLoad404Function;
  load500: TLoad500Function;
  start: TStartFunction;
  close: TCloseFunction;
}) {
  class CustomServerAdapter extends ServerAdapter {
    load = args.load as TLoadFunction;
    load404 = args.load404 as TLoad404Function;
    load500 = args.load500 as TLoad500Function;
    start = args.start as TStartFunction;
    close = args.close as TCloseFunction;
  }

  return CustomServerAdapter;
}

export default class ServerAdapter {
  request!: ServerRequestAdapter;
  response!: ServerResponseAdapter;

  async load(_domains: Domain[], _settings: ServerSettingsType): Promise<void> {
    return undefined;
  }

  async load404(_handler: ServerSettingsType['handler404']): Promise<void> {
    return undefined;
  }

  async load500(_handler: ServerSettingsType['handler500']): Promise<void> {
    return undefined;
  }

  async start(): Promise<void> {
    return undefined;
  }

  async close(): Promise<void> {
    return undefined;
  }
}
