import { models } from '@palmares/core';

export class ExampleModel extends models.Model {
    attributes = {
        number: new models.fields.IntegerField(),
    }

    options = {
        tableName: 'example_model'
    }
}