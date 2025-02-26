/**
 * Configuration options for auth adapters
 */
export interface AuthConfigurationType<
  TAdapterSpecificConfig extends Record<string, unknown> = Record<string, unknown>
> {
  /**
   * Additional adapter-specific configuration options
   */
  adapterConfig?: TAdapterSpecificConfig;
}

/**
 * Core authentication adapter interface that all auth adapters must implement
 */
export interface AuthAdapterType {
  readonly name?: string;
  readonly $$type: '$PAuthAdapter';
  readonly methods?: Record<string, any>;
}
