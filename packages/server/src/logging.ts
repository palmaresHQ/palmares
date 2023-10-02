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
  }
);
