import { SettingsType } from '@palmares/core';

import Std from './interfaces';

export type StdSettingsType = {
  STD: Promise<{ default: typeof Std }> | typeof Std;
} & SettingsType;
