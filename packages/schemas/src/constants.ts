export const DEFAULT_NUMBER_MAX_EXCEPTION = (max: number, inclusive: boolean) =>
  `The number is greater than the allowed ${max}.${inclusive ? ` The value ${max} is accepted as well.` : ''}`;
export const DEFAULT_NUMBER_MIN_EXCEPTION = (min: number, inclusive: boolean) =>
  `The number is less than the allowed ${min}.${inclusive ? ` The value ${min} is accepted as well.` : ''}`;
export const DEFAULT_NUMBER_NEGATIVE_EXCEPTION = (allowZero: boolean) =>
  `The number should be negative.${allowZero ? ` The value 0 is accepted as well.` : ''}`;
export const DEFAULT_NUMBER_POSITIVE_EXCEPTION = (allowZero: boolean) =>
  `The number should be positive.${allowZero ? ` The value 0 is accepted as well.` : ''}`;
export const DEFAULT_NUMBER_INTEGER_EXCEPTION = () => `THe number should be an integer.`;
