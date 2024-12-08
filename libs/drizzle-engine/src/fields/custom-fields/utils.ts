import type { Field, FieldWithOperationType, TextField } from '@palmares/databases';

export class DefaultBuilder<TField extends Field<any, any, any> | TextField<any, any, any>> {
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
      ._setNewBuilderMethods<DefaultBuilder<TField>>(new DefaultBuilder(this._.field, this._.type));
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
      ._setNewBuilderMethods<DefaultBuilder<TField>>(new DefaultBuilder(this._.field, this._.type));
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
      ._setNewBuilderMethods<DefaultBuilder<TField>>(new DefaultBuilder(this._.field, this._.type));
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
      ._setNewBuilderMethods<DefaultBuilder<TField>>(new DefaultBuilder(this._.field, this._.type));
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
      ._setNewBuilderMethods<DefaultBuilder<TField>>(new DefaultBuilder(this._.field, this._.type));
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
      ._setNewBuilderMethods<DefaultBuilder<TField>>(new DefaultBuilder(this._.field, this._.type));
  }
  notNull<
    TFieldData extends {
      fieldType: 'field' | 'textField';
      type: {
        create: any;
        update: any;
        read: any;
      };
      defintions: any;
    } = TField extends TextField<infer TType, infer TDefinitions, any>
      ? {
          fieldType: 'textField';
          type: {
            create: NonNullable<TType['read']>;
            update: NonNullable<TType['read']>;
            read: NonNullable<TType['read']>;
          };
          defintions: TDefinitions;
        }
      : TField extends Field<infer TType, infer TDefinitions, any>
        ? {
            fieldType: 'field';
            type: {
              create: NonNullable<TType['read']>;
              update: NonNullable<TType['read']>;
              read: NonNullable<TType['read']>;
            };
            defintions: TDefinitions;
          }
        : {
            fieldType: 'field';
            type: {
              create: any;
              update: any;
              read: any;
            };
            defintions: any;
          }
  >(): TFieldData['fieldType'] extends 'field'
    ? Field<
        TFieldData['type'],
        TFieldData['defintions'],
        TFieldData['type']['read'] extends number | Date
          ? Pick<
              FieldWithOperationType<TFieldData['type']['read']>,
              'lessThan' | 'greaterThan' | 'and' | 'in' | 'or' | 'eq' | 'is' | 'between'
            >
          : Pick<FieldWithOperationType<TFieldData['type']['read']>, 'and' | 'in' | 'or' | 'eq' | 'is'>
      >
    : TextField<
        TFieldData['type'],
        TFieldData['defintions'],
        TFieldData['type']['read'] extends number | Date
          ? Pick<
              FieldWithOperationType<TFieldData['type']['read']>,
              'lessThan' | 'greaterThan' | 'and' | 'in' | 'or' | 'eq' | 'is' | 'between'
            >
          : Pick<FieldWithOperationType<TFieldData['type']['read']>, 'and' | 'in' | 'or' | 'eq' | 'is'>
      > {
    // eslint-disable-next-line ts/no-unnecessary-type-assertion
    return this._.field
      ._setPartialAttributes<
        {
          create: TFieldData['type']['create'];
          update: TFieldData['type']['update'];
          read: TFieldData['type']['read'];
        },
        { create: 'replace'; update: 'replace'; read: 'replace' }
      >()({
        type: this._.type,
        args: (this._.field['__customAttributes'] as any)?.['args'],
        options: {
          ...((this._.field['__customAttributes'] as any)?.['options'] || {}),
          notNull: []
        }
      })
      ._setNewBuilderMethods<DefaultBuilder<TField>>(new DefaultBuilder(this._.field, this._.type)) as any;
  }
  generatedAlwaysAs(cb: `() => ${string}`): TField & DefaultBuilder<TField> {
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
      ._setNewBuilderMethods<DefaultBuilder<TField>>(new DefaultBuilder(this._.field, this._.type)) as any;
  }
}
