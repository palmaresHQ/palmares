interface TesteParams {
    allowNull: boolean,
    defaultValue: any,
}

class Teste implements TesteParams {
    allowNull: boolean;
    defaultValue: any;

    constructor(teste: TesteParams = { allowNull: true, defaultValue: false }) {
        this.allowNull = teste?.allowNull;
        this.defaultValue = teste?.defaultValue;
    }
}

const teste = new Teste({ allowNull: false, defaultValue: true });
console.log(teste.allowNull);