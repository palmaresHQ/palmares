import { Domain, SettingsType } from '@palmares/core';

import Std from './interfaces';
import config from './config';
import { StdSettingsType } from './settings';

export default class StdDomain extends Domain {
  constructor() {
    super(StdDomain.name, __dirname);
  }

  async load<S extends SettingsType = StdSettingsType>(
    settings: S & StdSettingsType
  ): Promise<void> {
    if (settings.STD) {
      let defaultStd: typeof Std;
      if (settings.STD instanceof Promise)
        defaultStd = (await settings.STD).default;
      else defaultStd = settings.STD;
      config.setDefaultStd(defaultStd);
    } else {
      throw new Error('STD is required in settings');
    }
  }
}
