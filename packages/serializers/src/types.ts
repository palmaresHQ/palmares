import { SettingsType } from "@palmares/core";
import ValidationError from "./exceptions";
import Field from "./fields";

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
