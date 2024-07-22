import type Schema from '../schema/schema';

/**
 * This will convert a value from a number to any other type.
 *
 * @param callback
 * @returns
 */
export default function convertFromNumberBuilder(
  callback: (value: number) => Awaited<ReturnType<Parameters<Schema['__parsers']['high']['set']>[1]>>
) {
  return (value: any) => callback(value);
}
