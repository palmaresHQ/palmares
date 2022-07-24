function classFactory (message = 'hello') {
  return class State {
    static default = message
  }
}

const teste1 = classFactory();
const teste2 = classFactory('world');
console.log(teste1.default);
console.log(teste2.default)
