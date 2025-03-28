import { getAdapterConfig, setAdapterConfig } from './conf';

export type AdapterMethods = {
  [key: string]: ((...params: any) => Promise<any> | any) | (new (...args: any[]) => any);
};

export type AdapterConfig = Record<string, any>;

export function authAdapter<
  const TArgs extends {
    readonly name: AuthAdapter['name'];
    methods: AuthAdapter['methods'];
    config?: AdapterConfig;
  },
  const TNewAdapter extends (..._args: any[]) => TArgs
>(
  newFn: TNewAdapter
): {
  new: (...args: Parameters<TNewAdapter>) => AuthAdapter & {
    methods: ReturnType<TNewAdapter>['methods'];
    name: ReturnType<TNewAdapter>['name'];
  };
};
export function authAdapter<T extends typeof AuthAdapter>(AdapterClass: T): T;
export function authAdapter(input: any) {
  // Case: Class-based adapter
  if (typeof input === 'function' && Object.getPrototypeOf(input) === AuthAdapter) {
    return input;
  }

  // Case: Function-based adapter
  const newFn = input;
  class CustomAuthAdapterBuilder {
    static new = (...args: any[]) => {
      const result = newFn(...args);
      const { name, methods, config } = result;

      class CustomAuthAdapter extends AuthAdapter {
        name = name;
        methods = methods;
      }

      // Store adapter config if provided
      if (config) {
        setAdapterConfig(name, config);
      }

      return new CustomAuthAdapter();
    };
  }

  return CustomAuthAdapterBuilder as unknown as {
    new: (...args: Parameters<typeof newFn>) => AuthAdapter & {
      methods: ReturnType<typeof newFn>['methods'];
      name: ReturnType<typeof newFn>['name'];
    };
  };
}

/**
 * Base adapter class that all auth adapters should extend from.
 */
export class AuthAdapter {
  readonly name!: string;
  methods!: AdapterMethods;

  /**
   * Factory function for creating a new AuthAdapter instance.
   */
  static new<TArgs extends any[]>(..._args: TArgs): AuthAdapter {
    throw new Error('AuthAdapter');
  }

  /**
   * Get the configuration for this adapter
   */
  getConfig<T = any>(): T {
    return getAdapterConfig<T>(this.name);
  }
}
