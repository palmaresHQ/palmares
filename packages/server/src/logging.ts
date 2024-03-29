import { Logger } from '@palmares/logging';

export const serverLogger = new Logger(
  {
    domainName: '@palmares/server',
  },
  {
    START_SERVER: {
      category: 'log',
      handler: (args: { port: number; serverName: string }) => `Server ${args.serverName} started on port ${args.port}`,
    },
    STOP_SERVER: {
      category: 'log',
      handler: (args: { serverName: string }) => `Server ${args.serverName} stopped`,
    },
    REQUEST_RECEIVED: {
      category: 'info',
      handler: (args: { method: string; url: string }) => `\x1b[3m${args.method}\x1b[0m ${args.url}`,
    },
  }
);
