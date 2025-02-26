export type AdapterMethods = {
  [key: string]: (...params: any) => Promise<any> | any;
};

export function authAdapter<
  const TArgs extends {
    readonly name: AuthAdapter['name'];
    methods: AuthAdapter['methods'];
  },
  const TNewAdapter extends (..._args: any[]) => TArgs
>(newFn: TNewAdapter) {
  class CustomAuthAdapterBuilder {
    static new = (...args: any[]) => {
      const nameAndMethods = newFn(...args);

      class CustomAuthAdapter extends AuthAdapter {
        name = nameAndMethods.name;
        methods = nameAndMethods.methods;
      }
      return new CustomAuthAdapter();
    };
  }

  return CustomAuthAdapterBuilder as unknown as {
    new: (...args: Parameters<TNewAdapter>) => AuthAdapter & {
      methods: ReturnType<TNewAdapter>['methods'];
      name: ReturnType<TNewAdapter>['name'];
    };
  };
}

/**
 * Base adapter class that all auth adapters should extend from.
 * Provides core authentication functionality and optional event/hook systems.
 * Specific auth strategies (JWT, Session, OAuth etc) implement their own methods.
 */
export class AuthAdapter {
  readonly name!: string;
  methods!: AdapterMethods;

  /**
   * Factory function for creating a new AuthAdapter instance.
   * This is the only required method that must be implemented.
   */
  static new<TArgs extends any[]>(..._args: TArgs): AuthAdapter {
    throw new Error('AuthAdapter');
  }
}
