import { models } from '@palmares/databases';

export class ExampleModel extends models.Model {
  fields = {
    number: new models.fields.IntegerField(),
    related: new models.fields.ForeignKeyField({
      relatedTo: 'RelatedModel',
      onDelete: models.fields.ON_DELETE.CASCADE
    }),
  }

  options = {
    tableName: 'example_model'
  }
}

export class RelatedModel extends models.Model {
  fields = {
    text: new models.fields.CharField({ maxLength: 255 }),
  }

  options = {
    tableName: 'example_model'
  }
}