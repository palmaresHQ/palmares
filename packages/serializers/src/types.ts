import { SettingsType } from "@palmares/core";
import ValidationError from "./exceptions";
import { Field, Empty } from "./fields";
import { Serializer } from "./serializers";

export type SerializersSettingsType = SettingsType & {
  ERROR_CLASS?: typeof ValidationError,
  ERROR_MESSAGES?: {
    [key: string]: ErrorMessagesType;
  }
}

export type ErrorMessagesType = string | (() => string | Promise<string>);

export type This<T extends new(...args: any) => any> = {
  new(...args: ConstructorParameters<T>): any
} & Pick<T, keyof T>

