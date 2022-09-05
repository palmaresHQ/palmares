import { SchemaNotImplementedError } from './exceptions';
import { Field, StringField, NumberField, BooleanField } from './fields';
import { Serializer } from './serializers';

/**
 * This is the Base schema class. It is used to translate a serializer into a schema. A schema is something like
 * zod, yup, joi, etc. It can be used to validate the data of the serializer. By default you should use the serializer
 * but sometimes you might feel that you are better off with another library instead of the serializer. This exists
 * to offers options to the users so they can use other validation libraries without needing to change the
 * serializer code.
 */
export default class Schema {
  async getField<
    I extends Field,
    D extends I["type"] | undefined,
    N extends boolean,
    R extends boolean,
    RO extends boolean,
    WO extends boolean,
    C = any
  >(field: Field<I, D, N, R, RO, WO, C>, isIn = true, ...custom: any[]): Promise<any> {
    throw new SchemaNotImplementedError('getField', this.constructor.name);
  }

  async getChar<
    I extends StringField = any,
    D extends I["type"] | undefined = undefined,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = boolean,
    WO extends boolean = boolean,
    C = any
  >(field: StringField<I, D, N, R, RO, WO, C>, isIn = true, ...custom: any[]): Promise<any> {
    throw new SchemaNotImplementedError('getChar', this.constructor.name);
  }

  async getNumber<
    I extends NumberField = any,
    D extends I["type"] | undefined = undefined,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = boolean,
    WO extends boolean = boolean,
    C = any
  >(field: NumberField<I, D, N, R, RO, WO, C>, isIn = true, ...custom: any[]): Promise<any> {
    throw new SchemaNotImplementedError('getNumber', this.constructor.name);
  }

  async getBool<
    I extends BooleanField = any,
    D extends I["type"] | undefined = undefined,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = boolean,
    WO extends boolean = boolean,
    C = any,
    T extends readonly any[] = ['true', 'True', 1, 'yes'],
    F extends readonly any[] = ['false', 'False', 0, 'no']
  >(field: BooleanField<I, D, N, R, RO, WO, C, T, F>, isIn = true, ...custom: any[]): Promise<any> {
    throw new SchemaNotImplementedError('getBool', this.constructor.name);
  }

  async getObject(field: Serializer, isIn = true, ...custom: any[]): Promise<any> {
    throw new SchemaNotImplementedError('getObject', this.constructor.name);
  }
}
