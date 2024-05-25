import { getDefaultAdapter } from './conf';
import Schema from './schema/schema';

export default async function compile(schemas: Record<string, Schema<any, any>>) {
  const schemasAsEntries = Object.entries(schemas);
  const adapter = getDefaultAdapter();

  for (const [keyName, schema] of schemasAsEntries) {
    await schema.compile(adapter);
  }
}
