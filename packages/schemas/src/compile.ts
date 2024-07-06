import { getDefaultStd } from '@palmares/core';

import { getDefaultAdapter } from './conf';
import Schema from './schema/schema';

export default async function compile(schemas: Record<string, Schema<any, any>>) {
  const schemasAsEntries = Object.entries(schemas);
  const adapter = getDefaultAdapter();
  const std = getDefaultStd();
  for (const [keyName, schema] of schemasAsEntries) {
    console.log(await schema.compile(adapter));
  }
}
