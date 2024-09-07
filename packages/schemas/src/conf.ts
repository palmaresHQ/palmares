import { NoAdapterFoundError } from './exceptions';

import type { SchemaAdapter } from './adapter';

declare global {
  // eslint-disable-next-line no-var
  var $PSchemasAdapter: SchemaAdapter | undefined;
}

/**
 * Sets the default adapter to be used by all of your schemas.
 *
 * @param adapter - The adapter to use when you define schemas.
 */
export function setDefaultAdapter(adapter: SchemaAdapter) {
  globalThis.$PSchemasAdapter = adapter;
}

/**
 * Gets the default adapter to be used by all of your schemas.
 *
 * @throws {NoAdapterFoundError} - If no adapter has been set.
 *
 * @returns The default adapter.
 */
export function getDefaultAdapter(): SchemaAdapter {
  if (!globalThis.$PSchemasAdapter) throw new NoAdapterFoundError();

  return globalThis.$PSchemasAdapter;
}
