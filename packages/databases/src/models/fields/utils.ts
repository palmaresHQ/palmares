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

export type TCompareCallback = (
  existingField: Field<any, any>,
  newField: Field<any, any>,
  defaultCompareCallback: TCompareCallback
) => [boolean, string[]];

// eslint-disable-next-line ts/require-await
export function defaultCompareCallback(
  existingField: Parameters<TCompareCallback>[0],
  newField: Parameters<TCompareCallback>[1],
  _: Parameters<TCompareCallback>[2]
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

export type TOptionsCallback = (
  oldField: Field<any, any>,
  newField: Field<any, any>,
  defaultOptionsCallback: TOptionsCallback
) => void;

// eslint-disable-next-line ts/require-await
export function defaultOptionsCallback(
  oldField: Parameters<TOptionsCallback>[0],
  newField: Parameters<TOptionsCallback>[1],
  _: Parameters<TOptionsCallback>[2]
) {
  newField['__allowNull'] = oldField['__allowNull'];
  newField['__customAttributes'] = oldField['__customAttributes'];
  newField['__defaultValue'] = oldField['__defaultValue'];
  newField['__dbIndex'] = oldField['__dbIndex'];
  newField['__databaseName'] = oldField['__databaseName'];
  newField['__primaryKey'] = oldField['__primaryKey'];
  newField['__underscored'] = oldField['__underscored'];
  newField['__unique'] = oldField['__unique'];
  newField['__isAuto'] = oldField['__isAuto'];
  newField['__fieldName'] = oldField['__fieldName'];
  newField['__model'] = oldField['__model'];
  newField['__customAttributes'] = oldField['__customAttributes'];
}

export type NewInstanceArgumentsCallback = (
  field: Field<any, any>,
  defaultNewInstanceArgumentsCallback: NewInstanceArgumentsCallback
) => any[];

// eslint-disable-next-line ts/require-await
export function defaultNewInstanceArgumentsCallback(
  _: Parameters<NewInstanceArgumentsCallback>[0],
  __: Parameters<NewInstanceArgumentsCallback>[1]
): any[] {
  return [];
}

export function getRelatedToAsString(field: ForeignKeyField<any, any>) {
  const relatedTo = field['__relatedTo'];
  const relatedToAsString = field['__relatedToAsString'];

  if (typeof relatedToAsString !== 'string') {
    if (typeof relatedTo === 'function') field['__relatedToAsString'] = relatedTo().getName();
    else if (typeof relatedTo === 'string') field['__relatedToAsString'] = relatedTo;
    else field['__relatedToAsString'] = relatedTo.getName();
  }
}
