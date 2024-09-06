export type EventEmitterOptionsType = {
  wildcards?: {
    use: boolean;
    delimiter?: string;
  };
  layer?: {
    // eslint-disable-next-line ts/consistent-type-imports
    use: import('./index').EventEmitter | Promise<import('./index').EventEmitter>;
    channels: string[];
  };
  results?: {
    /** How long we should wait for the result of the emitted event */
    timeout?: number;
    /** How long we should wait for the listener to notify it's handling on a result */
    pingTimeout?: number;
  };
};

export type ResultWrappedCallbackType = (
  resultsEventName: string,
  resultKey: string,
  channelLayer: string | null,
  ...data: any
) => Promise<void>;
