import { SettingsType } from "@palmares/core";
import ValidationError from "./exceptions";
import { Field } from "./fields";
import { Serializer } from "./serializers";

export type SerializersSettingsType = SettingsType & {
  ERROR_CLASS?: typeof ValidationError,
  ERROR_MESSAGES?: {
    [key: string]: ErrorMessagesType;
  }
}

export type ErrorMessagesType = string | (() => string | Promise<string>);

export type FieldErrorMessagesType = {
  required?: ErrorMessagesType,
  null?: ErrorMessagesType,
}

export type FieldParamsType = {
  source?: string;
  required?: boolean;
  defaultValue?: any;
  allowNull?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  errorMessages?: FieldErrorMessagesType;
}

export type CharFieldParamsType = {
  allowBlank?: boolean;
  maxLength?: number;
  minLength?: number,
} & FieldParamsType

export type SerializerParamsType<I extends Serializer, M extends boolean = boolean, C=any> = {
  instance?: any;
  data?: any;
  many?: M;
  context?: C;
} & FieldParamsType

export type SerializerFieldsType = {
  [key: string]: Field;
}
