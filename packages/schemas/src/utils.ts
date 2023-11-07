import { NumberAdapterTranslateArgs } from './adapter/types';

/**
 * The usage of this is that imagine that the library doesn't support a specific feature that we support on our schema definition, it can return an instance
 * of this class and with this instance we are able to fallback to our default implementation of the schema validation.
 */
export default class WithFallback {
  fallbackFor: Set<keyof Omit<NumberAdapterTranslateArgs, 'withFallbackFactory'>>;
  transformedSchema: any;
  adapterType: 'number' | 'object';

  constructor(
    adapterType: 'number' | 'object',
    fallbackFor: (keyof Omit<NumberAdapterTranslateArgs, 'withFallbackFactory'>)[],
    transformedSchema: any
  ) {
    this.adapterType = adapterType;
    this.fallbackFor = new Set<keyof Omit<NumberAdapterTranslateArgs, 'withFallbackFactory'>>(fallbackFor as any);
    this.transformedSchema = transformedSchema;
  }
}

export function withFallbackFactory(adapterType: WithFallback['adapterType']) {
  return (
    fallbackFor: (keyof Omit<NumberAdapterTranslateArgs, 'withFallbackFactory'>)[],
    transformedSchema: WithFallback['transformedSchema']
  ) => new WithFallback(adapterType, fallbackFor, transformedSchema);
}
