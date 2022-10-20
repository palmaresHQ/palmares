import Emitter from './emitter';

async function main() {
  const emitter = new Emitter();
  await emitter.addEventListener(
    () => {
      console.log('hello createUser');
    },
    { key: 'createUser' }
  );

  await emitter.addEventListener(
    () => {
      console.log('hello deleteUser');
    },
    { key: 'createUser' }
  );

  await emitter.emit({
    key: 'createUser',
  });
}

main();
