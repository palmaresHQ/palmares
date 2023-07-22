import { EventEmitter } from '@palmares/events';
import EventEmitter2Emitter from '@palmares/eventemitter2-emitter';
import RedisEmitter from '@palmares/redis-emitter';

async function main() {
  // Layer Vai ser tipo o Redis ou o RabbitMQ.
  const layer = await EventEmitter.new(RedisEmitter, {
    emitterParams: [{ url: 'redis://localhost:6379' }],
  });

  // Esses dois aqui usam o EventEmitter2 pq a ideia é funcionar localmente.
  const emitter2 = await EventEmitter.new(EventEmitter2Emitter, {
    layer: {
      use: layer,
      channels: ['users'],
    },
    results: {
      pingTimeout: 500,
      timeout: 5000,
    },
    wildcards: { use: true },
  });

  /*await emitter2.addEventListener('create.users', () => {
    return new Promise((resolve) =>
      setTimeout(() => resolve('create.user[1]'), 200)
    );
  });*/

  //await emitter.unsubscribeAll();
  // Imagina em sistemas distribuidos, vc consegue comunicar facilmente entre seus sistemas.
  const result = await emitter2.emitToChannel(['users'], 'create.user');
  console.log(result);
}
main();
