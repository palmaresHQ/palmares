export type AdapterTranslateArgs = {
  nullish: {
    allowUndefined: boolean;
    message: string;
  };
};

export type NumberAdapterTranslateArgs = {
  min:
    | {
        value: number;
        inclusive: boolean;
        message: string;
      }
    | undefined;
  max:
    | {
        value: number;
        inclusive: boolean;
        message: string;
      }
    | undefined;
  allowNegative:
    | {
        allowZero: boolean;
        message: string;
      }
    | undefined;
  allowPositive:
    | {
        allowZero: boolean;
        message: string;
      }
    | undefined;
  integer:
    | {
        message: string;
      }
    | undefined;
} & AdapterTranslateArgs;

export type ObjectAdapterTranslateArgs = {
  data: Record<string, any>;
} & AdapterTranslateArgs;
