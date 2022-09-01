import { SchemaNotImplementedError } from './exceptions';
import { Field, CharField } from './fields';
import { Serializer } from './serializers';

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
    I extends CharField = any,
    D extends I["type"] | undefined = undefined,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = boolean,
    WO extends boolean = boolean,
    C = any
  >(field: CharField<I, D, N, R, RO, WO, C>, isIn = true, ...custom: any[]): Promise<any> {
    throw new SchemaNotImplementedError('getChar', this.constructor.name);
  }

  async getObject(field: Serializer, isIn = true, ...custom: any[]): Promise<any> {
    throw new SchemaNotImplementedError('getObject', this.constructor.name);
  }
}
