import type { SettingsType2 } from './types';
import type Domain from '../domain/domain';
import type domain from '../domain/function';


export default function defineSettings<
  const TDomains extends readonly (
    | typeof Domain
    | ReturnType<typeof domain>
    | Promise<{ default: typeof Domain | ReturnType<typeof domain> }>
    | readonly [
        typeof Domain | ReturnType<typeof domain> | Promise<{ default: typeof Domain | ReturnType<typeof domain> }>,
        any,
      ]
  )[] = readonly [],
>(args: SettingsType2<TDomains>) {
  return args;
}
