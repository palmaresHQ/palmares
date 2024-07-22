import type Schema from '../schema/schema';

/**
 * This will convert a value from a string to any other type.
 *
 * @param callback
 * @returns
 */
export default function convertFromStringBuilder(
  callback: (value: string) => Awaited<ReturnType<Parameters<Schema['__parsers']['high']['set']>[1]>>
): Parameters<Schema['__parsers']['high']['set']>[1] {
  return (value: any) => {
    if (typeof value === 'string') return callback(value);
    return {
      value,
      preventNextParsers: false,
    };
  };
}
