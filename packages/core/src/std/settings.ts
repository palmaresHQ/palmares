import type { Std } from '../std-adapter';

export type StdSettingsType = {
  STD: Promise<{ default: typeof Std }> | typeof Std;
};
