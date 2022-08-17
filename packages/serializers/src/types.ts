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
