import { CreateModel } from "./src/migrations/actions";
import { Model, fields } from "./src/models";

class Teste extends Model {
  fields = {
    teste: new fields.IntegerField(),
    firstName: new fields.CharField(),
  }
}

const main = async () => {
  const TesteInstance = new Teste();

  const data = await CreateModel.toGenerate("teste", "teste", Teste.name, { fields: TesteInstance.fields, options: {} });
  console.log(await CreateModel.toString(1, data));
}

main()
