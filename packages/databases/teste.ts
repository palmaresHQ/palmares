import { ChangeModel, CreateModel } from "./src/migrations/actions";
import { Model, fields } from "./src/models";

class Teste extends Model {
  fields = {
    teste: new fields.IntegerField(),
    firstName: new fields.CharField(),
  }

  options = {
    tableName: 'teste'
  }
}

const main = async () => {
  const TesteInstance = new Teste();

  const data = await ChangeModel.toGenerate("teste", "teste", Teste.name, {
    optionsBefore: TesteInstance.options,
    optionsAfter: {
      tableName: 'teste',
      ordering: ['teste']
    }
  });
  console.log(await ChangeModel.toString(1, data));
}

main()
