import { EventEmitter, eventsServer } from '@palmares/events';
import EventEmitter2Emitter from '@palmares/eventemitter2-emitter';
import RedisEmitter from '@palmares/redis-emitter';

async function main() {
  // Layer Vai ser tipo o Redis ou o RabbitMQ.
  const layer = await EventEmitter.new(RedisEmitter, {
    emitterParams: [{ url: 'redis://localhost:6379' }],
  });

  const emitter = await EventEmitter.new(EventEmitter2Emitter, {
    layer: {
      use: layer,
      channels: ['users'],
    },
    wildcards: { use: true },
  });

  const emitter2 = await EventEmitter.new(EventEmitter2Emitter, {
    layer: {
      use: layer,
      channels: ['users'],
    },
    wildcards: { use: true },
  });

  await emitter2.addEventListener('create.users', () => {
    console.log('aqui');
    return 'create.user[2]';
  });

  await emitter.addEventListener('create.users', () => {
    console.log('aqui2');
    return 'create.user[3]';
  });

  //await emitter2.unsubscribeFromChannel('users');

  const server = eventsServer();
  server.listen(() => {
    console.log('Events Server running');
  });
}
main();
