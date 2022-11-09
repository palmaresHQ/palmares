import { AppServer } from '@palmares/core';
import { EventsServer, default as eventsServer } from './server';

export default class EventsAppServer extends AppServer {
  server!: EventsServer;

  async load() {
    this.server = eventsServer();
  }

  async start() {
    await Promise.all([
      super.start(),
      this.server.listen(() => {
        console.log('Events server started');
      }),
    ]);
  }
}
