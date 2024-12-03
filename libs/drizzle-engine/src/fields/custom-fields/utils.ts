import type { Field, TextField } from '@palmares/databases';

export class DefaultBuilder<TType, TField extends Field<any, any, any> | TextField<any, any, any>> {
  _: {
    field: TField;
    type: string;
  };

  constructor(fieldInstance: TField, type: string) {
    this._ = {
      field: fieldInstance,
      type
    };
  }

  $type<TType>() {
    return this._.field
      ._setPartialAttributes<
        { create: TType; update: TType; read: TType },
        { create: 'replace'; update: 'replace'; read: 'replace' }
      >()(this._.field['__customAttributes'])
      ._setNewBuilderMethods<DefaultBuilder<TType, TField>>();
  }
  $default(cb: `() => ${string}`) {
    // eslint-disable-next-line ts/no-unnecessary-type-assertion
    return this._.field
      ._setPartialAttributes()({
        type: this._.type,
        args: (this._.field['__customAttributes'] as any)?.['args'],
        options: {
          ...((this._.field['__customAttributes'] as any)?.['options'] || {}),
          $default: [cb]
        }
      })
      ._setNewBuilderMethods<DefaultBuilder<TType, TField>>();
  }
  $onUpdate(cb: `() => ${string}`) {
    // eslint-disable-next-line ts/no-unnecessary-type-assertion
    return this._.field
      ._setPartialAttributes()({
        type: this._.type,
        args: (this._.field['__customAttributes'] as any)?.['args'],
        options: {
          ...((this._.field['__customAttributes'] as any)?.['options'] || {}),
          $onUpdate: [cb]
        }
      })
      ._setNewBuilderMethods<DefaultBuilder<TType, TField>>();
  }
  references(cb: `() => ${string}`) {
    // eslint-disable-next-line ts/no-unnecessary-type-assertion
    return this._.field
      ._setPartialAttributes()({
        type: this._.type,
        args: (this._.field['__customAttributes'] as any)?.['args'],
        options: {
          ...((this._.field['__customAttributes'] as any)?.['options'] || {}),
          references: [cb]
        }
      })
      ._setNewBuilderMethods<DefaultBuilder<TType, TField>>();
  }
  primaryKey() {
    // eslint-disable-next-line ts/no-unnecessary-type-assertion
    return this._.field
      ._setPartialAttributes()({
        type: this._.type,
        args: (this._.field['__customAttributes'] as any)?.['args'],
        options: {
          ...((this._.field['__customAttributes'] as any)?.['options'] || {}),
          primaryKey: true
        }
      })
      ._setNewBuilderMethods<DefaultBuilder<TType, TField>>();
  }
  unique() {
    // eslint-disable-next-line ts/no-unnecessary-type-assertion
    return this._.field
      ._setPartialAttributes()({
        type: this._.type,
        args: (this._.field['__customAttributes'] as any)?.['args'],
        options: {
          ...((this._.field['__customAttributes'] as any)?.['options'] || {}),
          unique: true
        }
      })
      ._setNewBuilderMethods<DefaultBuilder<TType, TField>>();
  }
  notNull() {
    // eslint-disable-next-line ts/no-unnecessary-type-assertion
    return this._.field
      ._setPartialAttributes<
        { create: TType; update: TType; read: TType },
        { create: 'replace'; update: 'replace'; read: 'replace' }
      >()({
        type: this._.type,
        args: (this._.field['__customAttributes'] as any)?.['args'],
        options: {
          ...((this._.field['__customAttributes'] as any)?.['options'] || {}),
          notNull: false
        }
      })
      ._setNewBuilderMethods<DefaultBuilder<TType, TField>>();
  }
  generatedAlwaysAs(cb: `() => ${string}`) {
    // eslint-disable-next-line ts/no-unnecessary-type-assertion
    return this._.field
      ._setPartialAttributes()({
        type: this._.type,
        args: (this._.field['__customAttributes'] as any)?.['args'],
        options: {
          ...((this._.field['__customAttributes'] as any)?.['options'] || {}),
          generatedAlwaysAs: [cb]
        }
      })
      ._setNewBuilderMethods<DefaultBuilder<TType, TField>>();
  }
}
