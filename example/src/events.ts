import { EventEmitter } from '@palmares/events';
import EventEmitter2Emitter from '@palmares/eventemitter2-emitter';

async function main() {
  // Layer Vai ser tipo o Redis ou o RabbitMQ.
  const layer = await EventEmitter.new(EventEmitter2Emitter);

  // Esses dois aqui usam o EventEmitter2 pq a ideia é funcionar localmente.
  const emitter2 = await EventEmitter.new(EventEmitter2Emitter, {
    layer: {
      use: layer,
      channels: ['users'],
    },
    wildcards: { use: true },
  });
  const emitter = await EventEmitter.new(EventEmitter2Emitter, {
    layer: {
      use: layer,
      channels: ['birds', 'users'],
    },
    wildcards: { use: true },
  });
  // retorna create.user[1]
  await emitter2.addEventListener('create.user', () => {
    return new Promise((resolve) =>
      setTimeout(() => resolve('create.user[1]'), 200)
    );
  });
  // Retorna create.user[2]
  await emitter.addEventListener('create.user', () => 'create.user[2]');

  emitter.

  // Imagina em sistemas distribuidos, vc consegue comunicar facilmente entre seus sistemas.
  const result = await emitter.emitToChannel(['users', 'birds'], 'create.*');
  console.log(result);
}
main();
