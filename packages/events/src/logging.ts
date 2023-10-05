import { Logger } from '@palmares/logging';

export const eventsLogger = new Logger(
  { domainName: '@palmares/events' },
  {
    APP_START_EVENTS_SERVER: {
      category: 'info',
      handler: ({ appName }: { appName: string }) =>
        `${appName} is running an events server and will only listen for events.\nPress Ctrl+C to quit.`,
    },
  }
);
