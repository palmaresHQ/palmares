import { SettingsType } from '@palmares/core';

import Emitter from './emitter';
import { EventEmitterOptionsType } from './events/types';

export type EventsSettingsType = {
  EVENTS_EMITTER: Promise<{ default: typeof Emitter }> | typeof Emitter;
  EVENTS_OPTIONS: EventEmitterOptionsType & {
    emitterParams?: any[];
  };
} & SettingsType;
