export type ValidatorTypes = 'low' | 'medium' | 'high';

class Dog {
  au() {
    return 'au';
  }
}

const validate = (value: any) => {
  if (value instanceof Dog) {
    return [value, true];
  }
  if (typeof value === 'string') return [value, true];
  if (typeof value === 'number') return [value, true];
  return [undefined, false];
};
