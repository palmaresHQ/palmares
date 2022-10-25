import { EventEmitter } from 'events';

const startTimeInMs = new Date().getTime();
const nativeEventEmitter = new EventEmitter();
nativeEventEmitter.on('FirstEvent', function (data) {
  console.log('First subscriber: ' + data);
});

nativeEventEmitter.on('FirstEvent', function (data) {
  console.log('hello: ' + data);
});

// Raising FirstEvent
nativeEventEmitter.emit(
  'FirstEvent',
  'This is my first Node.js event emitter example.'
);

const endTimeInMs = new Date().getTime();
const durationInMs = endTimeInMs - startTimeInMs;

console.log(`nativeEventEmitter took ${durationInMs} ms`);
