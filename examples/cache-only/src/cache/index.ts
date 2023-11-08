import { domain } from '@palmares/core';
import { setCachedAdapter } from 'packages/cache/src/config';
import { CacheAdapterImpl } from './adapter';

export default domain('cache', __dirname, {
 load: async() => {
  const adapter = new CacheAdapterImpl()
  setCachedAdapter(adapter)
 }
});
