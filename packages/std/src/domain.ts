import { Domain, domain } from '@palmares/core';

import Std from './interfaces';
import { setDefaultStd } from './config';
import { StdSettingsType } from './settings';

//@ts-ignore
export default domain('@palmares/std', __dirname || import.meta.url, {
  load: async (settings: StdSettingsType) => {
    if (settings.STD) {
      let defaultStd: typeof Std;
      if (settings.STD instanceof Promise) defaultStd = (await settings.STD).default;
      else defaultStd = settings.STD;
      setDefaultStd(defaultStd);
    } else throw new Error('STD is required in settings');
  },
});
