import { NoAdapterFoundError } from './exceptions';

import type SchemaAdapter from './adapter';

let cachedAdapter: SchemaAdapter | null = null;

/**
 * Sets the default adapter to be used by all of your schemas.
 *
 * @param adapter - The adapter to use when you define schemas.
 */
export function setDefaultAdapter(adapter: SchemaAdapter) {
  cachedAdapter = adapter;
}

/**
 * Gets the default adapter to be used by all of your schemas.
 *
 * @throws {NoAdapterFoundError} - If no adapter has been set.
 *
 * @returns The default adapter.
 */
export function getDefaultAdapter(): SchemaAdapter {
  if (!cachedAdapter) throw new NoAdapterFoundError();

  return cachedAdapter;
}
