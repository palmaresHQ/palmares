import { SettingsType } from '@palmares/core';

import Emitter from './emitter';
import { EventEmitterOptionsType } from './events/types';

export type EventsSettingsType<E extends typeof Emitter = typeof Emitter> = {
  EVENTS_EMITTER: Promise<{ default: E }> | E;
  EVENTS_OPTIONS?: EventEmitterOptionsType & {
    emitterParams?: any[];
  };
} & SettingsType;
