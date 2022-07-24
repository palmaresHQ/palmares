class Teste {
  static default = 'teste';
}

const teste = new Teste();
console.log((teste as unknown as typeof Teste).default);
