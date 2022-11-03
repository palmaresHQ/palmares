export type EventEmitterOptionsType = {
  wildcards?: {
    use: boolean;
    delimiter?: string;
  };
  layer?: {
    use: import('./index').default;
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
