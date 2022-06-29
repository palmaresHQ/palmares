import { models } from '@palmares/core';

export class ExampleModel extends models.Model {
  fields = {
    number: new models.fields.IntegerField(),
  }

  options = {
    tableName: 'example_model'
  }
}