import type { Field } from './field';
import type { ForeignKeyField } from './foreign-key';

export type ToStringCallback = (
  field: Field<any, any>,
  defaultToStringCallback: ToStringCallback,
  indentation?: number,
  customParams?: string | undefined
) => Promise<string>;

// eslint-disable-next-line ts/require-await
export async function defaultToStringCallback(
  field: Parameters<ToStringCallback>[0],
  _: Parameters<ToStringCallback>[1],
  indentation: Parameters<ToStringCallback>[2] = 0,
  customParams: Parameters<ToStringCallback>[3] = undefined
): Promise<string> {
  const ident = '  '.repeat(indentation);
  const fieldParamsIdent = '  '.repeat(indentation + 1);
  return (
    `${ident}models.fields.${field.constructor.name}.new({` +
    `${customParams ? `\n${customParams}` : ''}\n` +
    `${fieldParamsIdent}primaryKey: ${field['__primaryKey']},\n` +
    `${fieldParamsIdent}defaultValue: ${JSON.stringify(field['__defaultValue'])},\n` +
    `${fieldParamsIdent}allowNull: ${field['__allowNull']},\n` +
    `${fieldParamsIdent}unique: ${field['__unique']},\n` +
    `${fieldParamsIdent}dbIndex: ${field['__dbIndex']},\n` +
    `${fieldParamsIdent}databaseName: "${field['__databaseName']}",\n` +
    `${fieldParamsIdent}underscored: ${field['__underscored']},\n` +
    `${fieldParamsIdent}customAttributes: ${JSON.stringify(field['__customAttributes'])}\n` +
    `${ident}})`
  );
}

export type CompareCallback = (
  existingField: Field<any, any>,
  newField: Field<any, any>,
  defaultCompareCallback: CompareCallback
) => [boolean, string[]];

// eslint-disable-next-line ts/require-await
export function defaultCompareCallback(
  existingField: Parameters<CompareCallback>[0],
  newField: Parameters<CompareCallback>[1],
  _: Parameters<CompareCallback>[2]
): [boolean, string[]] {
  const isTypeNameEqual =
    (existingField.constructor as typeof Field<any, any>)['__typeName'] ===
    (newField.constructor as typeof Field<any, any>)['__typeName'];
  const isAllowNullEqual = existingField['__allowNull'] === newField['__allowNull'];
  const isCustomAttributesEqual =
    JSON.stringify(existingField['__customAttributes']) === JSON.stringify(newField['__customAttributes']);
  const isPrimaryKeyEqual = existingField['__primaryKey'] === newField['__primaryKey'];
  const isDefaultValueEqual = existingField['__defaultValue'] === newField['__defaultValue'];
  const isUniqueEqual = existingField['__unique'] === newField['__unique'];
  const isDbIndexEqual = existingField['__dbIndex'] === newField['__dbIndex'];
  const isDatabaseNameEqual = existingField['__databaseName'] === newField['__databaseName'];
  const isUnderscoredEqual = existingField['__underscored'] === newField['__underscored'];
  const changedAttributes = [
    !isTypeNameEqual && 'typeName',
    !isAllowNullEqual && 'allowNull',
    !isCustomAttributesEqual && 'customAttributes',
    !isPrimaryKeyEqual && 'primaryKey',
    !isDefaultValueEqual && 'defaultValue',
    !isUniqueEqual && 'unique',
    !isDbIndexEqual && 'dbIndex',
    !isDatabaseNameEqual && 'databaseName',
    !isUnderscoredEqual && 'underscored'
  ].filter((attr) => typeof attr === 'string');
  return [changedAttributes.length === 0, changedAttributes];
}

export type OptionsCallback = (
  /**
   * This will set the value of an old field to a new field.
   *
   * By default we let the Author/Maintainer of the package override the values of the old field if they
   * want to. Because of that. We have to pass the hiddenFieldName and getArgumentsFieldName to the function.
   *
   * @param hiddenFieldName - The hidden field name that is the argument that lives inside of your class, it's
   * hidden from the end user and from the author/maintainer of the package. Just you have access to it.
   * @param getArgumentsFieldName - On `getArgumentsCallback` we show some data (originally private) to the Author
   * /Maintainer. The Author should never have access to our internal implementation. This string maps each key
   * from that object. If set to undefined, the Author cannot override this value.
   * @param value - The value that you want to set to the field.
   */
  setFieldValue: (hiddenFieldName: string, getArgumentsFieldName: string | undefined, value: any) => void,
  oldField: Field<any, any>,
  defaultOptionsCallback: OptionsCallback
) => void;

// eslint-disable-next-line ts/require-await
export function defaultOptionsCallback(
  setFieldValue: Parameters<OptionsCallback>[0],
  oldField: Parameters<OptionsCallback>[1],
  _: Parameters<OptionsCallback>[2]
) {
  setFieldValue('__allowNull', 'allowNull', oldField['__allowNull']);
  setFieldValue('__customAttributes', 'customAttributes', oldField['__customAttributes']);
  setFieldValue('__defaultValue', 'defaultValue', oldField['__defaultValue']);
  setFieldValue('__dbIndex', 'dbIndex', oldField['__dbIndex']);
  setFieldValue('__databaseName', 'databaseName', oldField['__databaseName']);
  setFieldValue('__primaryKey', 'primaryKey', oldField['__primaryKey']);
  setFieldValue('__underscored', 'underscored', oldField['__underscored']);
  setFieldValue('__unique', 'unique', oldField['__unique']);
  setFieldValue('__isAuto', 'isAuto', oldField['__isAuto']);
  setFieldValue('__fieldName', 'fieldName', oldField['__fieldName']);
  setFieldValue('__model', undefined, oldField['__model']);
}

export type NewInstanceArgumentsCallback = (
  field: Field<any, any>,
  defaultNewInstanceArgumentsCallback: NewInstanceArgumentsCallback
) => any[];

// eslint-disable-next-line ts/require-await
export function defaultNewInstanceArgumentsCallback(
  _field: Parameters<NewInstanceArgumentsCallback>[0],
  _defaultNewInstanceArgumentsCallback: Parameters<NewInstanceArgumentsCallback>[1]
): any[] {
  return [];
}

export function getRelatedToAsString(field: ForeignKeyField<any, any>) {
  const relatedTo = field['__relatedTo'];
  const relatedToAsString = field['__relatedToAsString'];

  if (typeof relatedToAsString !== 'string') {
    if (typeof relatedTo === 'function' && relatedTo['$$type'] !== '$PModel')
      field['__relatedToAsString'] = relatedTo()['__getName']();
    else if (typeof relatedTo === 'string') field['__relatedToAsString'] = relatedTo;
    else field['__relatedToAsString'] = relatedTo['__getName']();
  }
}

export type GetArgumentsCallback = (
  field: Field<any, any>,
  defaultOptionsCallback: typeof defaultGetArgumentsCallback
) => any;

// eslint-disable-next-line ts/require-await
export function defaultGetArgumentsCallback(
  field: Parameters<GetArgumentsCallback>[0],
  _: Parameters<GetArgumentsCallback>[1]
) {
  const fieldConstructor = field.constructor as typeof Field<any, any>;
  return {
    $field: field,
    $model: field['__model'],
    typeName: fieldConstructor['__typeName'],
    fieldName: field['__fieldName'],
    isAuto: field['__isAuto'] as boolean,
    primaryKey: field['__primaryKey'] as boolean,
    defaultValue: field['__defaultValue'],
    allowNull: field['__allowNull'] as boolean,
    unique: field['__unique'] as boolean,
    dbIndex: field['__dbIndex'] as boolean,
    databaseName: field['__databaseName'] as string | undefined,
    underscored: field['__underscored'] as boolean,
    customAttributes: field['__customAttributes']
  };
}
