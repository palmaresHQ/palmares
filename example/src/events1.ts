import { EventEmitter, eventsServer } from '@palmares/events';
import EventEmitter2Emitter from '@palmares/eventemitter2-emitter';
import RedisEmitter from '@palmares/redis-emitter';

async function main() {
  // Layer Vai ser tipo o Redis ou o RabbitMQ.
  const layer = await EventEmitter.new(RedisEmitter, {
    emitterParams: ['redis://localhost:6379'],
  });

  const emitter = await EventEmitter.new(EventEmitter2Emitter, {
    layer: {
      use: layer,
      channels: ['users'],
    },
    wildcards: { use: true },
  });

  // Retorna create.user[2]
  await emitter.addEventListener('create.users', () => {
    console.log('aqui');
    return 'create.user[2]';
  });

  await emitter.addEventListener('create.users', () => {
    console.log('aqui2');
  });

  //await emitter.unsubscribeAll();
  // Imagina em sistemas distribuidos, vc consegue comunicar facilmente entre seus sistemas.
  //const result = await emitter.emitToChannel(['users', 'birds'], 'create.*');

  eventsServer().listen(() => {
    console.log('Process is running and listening for events');
  });
}
main();
