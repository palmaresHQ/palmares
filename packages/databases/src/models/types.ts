import { Field } from "./fields";
import model, { Model }  from './model';
import Manager from './manager';
import { DatabaseSettingsType } from "../types";

export type ManagerInstancesType = {
  [engineName: string]: any;
}

export type ManagerEngineInstancesType = {
  [engineName: string]: any;
}

export type ModelFieldsType = {
  [key: string | symbol]: Field<any, boolean>
}

export type ManagersOfInstanceType = {
  [key: string]: Manager
}

export type ModelIndexType = {
  unique: true,
  fields: string[];
}

type OrderingOfModelOptions<M extends Model = Model> = keyof M["_fields"] |
  keyof { [F in keyof M["_fields"] as F extends string ? `-${F}` : never] : 1} | string;


export type ModelOptionsType<M extends Model = Model> = {
  indexes?: ModelIndexType[],
  ordering?: OrderingOfModelOptions<M>[],
  abstract?: boolean,
  underscored?: boolean,
  tableName?: string,
  managed?: boolean,
  databases?: string[],
  customOptions?: any
}

export interface ModelType {
  fields: ModelFieldsType;
  options: ModelOptionsType;
  name: string;
  abstracts: typeof Model[];
  instances?: Map<keyof DatabaseSettingsType["DATABASES"], any>;
}

export type TModel = InstanceType<ReturnType<typeof model>>

type HasDefaultValueFields<M extends ModelFieldsType> = {
  [F in keyof M as M[F]['hasDefaultValue'] extends false ? never : F] : M[F]
}

type OptionalFields<M extends Model> = {
  [F in keyof HasDefaultValueFields<M['fields']>]?: AddNull<M['fields'][F extends string ? F : never]>
}

type AllOptionalFields<M extends Model> = {
  [F in keyof M["fields"]]?: AddNull<M['fields'][F extends string ? F : never]>
}

type DoNotHaveDefaultValueFields<M extends ModelFieldsType> = {
  [F in keyof M as M[F]['hasDefaultValue'] extends false ? F : never] : M[F]
}

type RequiredFields<M extends Model> = {
  [F in keyof DoNotHaveDefaultValueFields<M["fields"]>]: AddNull<M['fields'][F extends string ? F : never]>
}

type AllRequiredFields<M extends Model> = {
  [F in keyof M["fields"]]: AddNull<M['fields'][F extends string ? F : never]>
}

type AddNull<F extends Field<any, boolean>> = F['allowNull'] extends true ?
  F['type'] | null : F['type']

export type ModelFields<M extends Model> = RequiredFields<M> & OptionalFields<M>

export type AllRequiredModelFields<M extends Model> = AllRequiredFields<M>;

export type AllOptionalModelFields<M extends Model> = AllOptionalFields<M>;
