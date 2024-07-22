import type Emitter from './emitter';
import type { EventEmitterOptionsType } from './events/types';
import type { SettingsType } from '@palmares/core';

export type EventsSettingsType<TEmitter extends typeof Emitter = typeof Emitter> = {
  EVENTS_EMITTER: Promise<{ default: TEmitter }> | TEmitter;
  EVENTS_OPTIONS?: EventEmitterOptionsType & {
    emitterParams?: any[];
  };
} & SettingsType;
