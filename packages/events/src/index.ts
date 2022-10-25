import Emitter from './emitter';
import { EventEmitter } from 'events';

const nativeEventEmitter = new EventEmitter();
const emitter = new Emitter();
nativeEventEmitter.on('FirstEvent', function (data) {
  data.a + data.b;
});

async function testNativeEvent() {
  // Raising FirstEvent
  const addEventListenerStartTimeInMs = performance.now();
  nativeEventEmitter.on('FirstEvent', function (data) {
    data.a + data.b;
  });
  const addEventListenerInMs = performance.now();
  const addEventListenerDurationInMs =
    addEventListenerInMs - addEventListenerStartTimeInMs;
  console.log(addEventListenerDurationInMs);

  const emitStartTimeInMs = performance.now();
  nativeEventEmitter.emit('FirstEvent', { a: 1, b: 2 });
  const emitInMs = performance.now();
  const emitDurationInMs = emitInMs - emitStartTimeInMs;
  console.log(emitDurationInMs);

  const unsubscribeStartTimeInMs = performance.now();
  nativeEventEmitter.removeAllListeners();
  const unsubscribeInMs = performance.now();
  const unsubscribeDurationInMs = unsubscribeInMs - unsubscribeStartTimeInMs;
  console.log(unsubscribeDurationInMs);
}

async function testCustomEvent() {
  const unsubscribe = await emitter.addEventListener(
    'create.user',
    (data: { a: number; b: number }) => {
      data.a + data.b;
    }
  );
  emitter.emit('create.user', { a: 1, b: 2 });
  await unsubscribe();
}

async function main() {
  const unsubscribe2 = await emitter.addEventListener(
    (data: {}) => {
      data.a + data.b;
    },
    { key: 'create.user', isUnique: true }
  );
  emitter.emit({ key: 'create.user' }, { a: 1, b: 2 });
  await unsubscribe2();

  const unsubscribe3 = await emitter.addEventListener(
    (data) => {
      data.a + data.b;
    },
    { key: 'create.user', isUnique: true }
  );
  emitter.emit('create.user', { a: 1, b: 2 });
  await unsubscribe3();

  /*
  const suite = new Suite();

  suite

    .add('NativeEventEmitter', async function () {
      await testNativeEvent();
    })
    .add('CustomEventEmitter', async function () {
      await testCustomEvent();
    })
    .on('cycle', function (event: any, bench: any) {
      console.log(String(event.target));
    })
    .on('complete', function (this: any) {
      console.log('\nFastest is ' + this.filter('fastest').map('name'));
    })
    .run({ async: true });
    */
}

main();
