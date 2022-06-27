export class DatabaseNoEngineFoundError extends Error {
  constructor(databaseName: string) {
    super(`No engine found for database ${databaseName}`);
  }
}