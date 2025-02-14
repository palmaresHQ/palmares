export class ServerAdapterNotInitialized extends Error {
  constructor(serverName: string) {
    super('Server adapter with name ' + serverName + ' not initialized');
  }
}
