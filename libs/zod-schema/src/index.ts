import { Schema, Field, StringField, BooleanField, Serializer, SerializerType } from '@palmares/serializers';

import { z } from 'zod';

type Null<T extends z.ZodTypeAny, N extends boolean> = N extends true ? z.ZodNullable<T> : T;
type Undefined<T extends z.ZodTypeAny, R extends boolean> = R extends false ? z.ZodOptional<T> : T;
export default class ZodSchema extends Schema {
  async getField<
    I extends Field,
    D extends I["type"] | undefined,
    N extends boolean,
    R extends boolean,
    RO extends boolean,
    WO extends boolean,
    C = any
  >(field: Field<I, D, N, R, RO, WO, C>, isIn = true, constructor?: z.ZodType): Promise<z.ZodType> {
    const fieldConstructor = constructor || z.any();
    if (!field.required) fieldConstructor.optional();
    if (!field.allowNull) fieldConstructor.nullable();
    if (field.defaultValue !== undefined) fieldConstructor.default(field.defaultValue);
    return fieldConstructor as Null<Undefined<z.ZodType, R>, N>;
  }

  async getChar<
    I extends StringField,
    D extends I["type"] | undefined,
    N extends boolean,
    R extends boolean,
    RO extends boolean,
    WO extends boolean,
    C = any
  >(field: StringField<I, D, N, R, RO, WO, C>, isIn = true) {
    const stringConstructor = z.string();
    if (field.minLength) stringConstructor.min(field.minLength);
    if (field.maxLength) stringConstructor.max(field.maxLength);
    if (field.allowBlank) stringConstructor.min(1);
    await this.getField(field, isIn, stringConstructor);
    return stringConstructor as Null<Undefined<z.ZodString, R>, N>;
  }

  async getBool<
    I extends BooleanField,
    D extends I['type'] | undefined,
    N extends boolean,
    R extends boolean,
    RO extends boolean,
    WO extends boolean,
    T extends readonly any[],
    F extends readonly any[],
    C = any,
  >(field: BooleanField<I, D, N, R, RO, WO, C, T, F>, isIn?: boolean, ...custom: any[]): Promise<any> {
    const booleanConstructor = z.boolean();
    await this.getField(field, isIn, booleanConstructor);
    return booleanConstructor as Null<Undefined<z.ZodBoolean, R>, N>;
  }

  async getObject<
    I extends Serializer,
    M extends boolean,
    C,
    D extends SerializerType<I> | undefined,
    N extends boolean,
    R extends boolean,
    RO extends boolean,
    WO extends boolean
  >(field: Serializer<I, M, C, D, N, R, RO, WO>, isIn = true) {
    const schemaFields: { [key: string]: z.ZodType } = {};
    const fieldsEntries = Object.entries(field.fields);
    const promises = fieldsEntries.map(async ([fieldName, field]) => {
      if (isIn && field.readOnly) return;
      if (!isIn && field.writeOnly) return;
      schemaFields[fieldName] = await field.schema(isIn, this);
    });
    await Promise.all(promises);
    const objectConstructor = z.object(schemaFields);
    await this.getField(field as Field<I, D, N, R, RO, WO>, isIn, objectConstructor);
    return objectConstructor;
  }
}
