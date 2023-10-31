export type AdapterTranslateArgs = {
  nullish: {
    allowUndefined: boolean;
    message: string;
  };
};

export type NumberAdapterTranslateArgs = {
  min: {
    value: number;
    inclusive: boolean;
    message: string;
  };
  max: {
    value: number;
    inclusive: boolean;
    message: string;
  };
  allowNegative: {
    allowZero: boolean;
    message: string;
  };
  allowPositive: {
    allowZero: boolean;
    message: string;
  };
} & AdapterTranslateArgs;
