import { adapterFieldParser } from '@palmares/databases';

import { getBuilderArgs } from './utils';

import type { CustomArgs } from './types';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';
import type {
  bigint as dMySqlBigInt,
  binary as dMySqlBinary,
  boolean as dMySqlBoolean,
  char as dMySqlChar,
  date as dMySqlDate,
  datetime as dMySqlDateTime,
  decimal as dMySqlDecimal,
  double as dMySqlDouble,
  mysqlEnum as dMySqlEnum,
  float as dMySqlFloat,
  int as dMySqlInteger,
  json as dMySqlJson,
  mediumint as dMySqlMediumInt,
  real as dMySqlReal,
  serial as dMySqlSerial,
  smallint as dMySqlSmallInt,
  text as dMySqlText,
  time as dMySqlTime,
  timestamp as dMySqlTimestamp,
  tinyint as dMySqlTinyInt,
  varbinary as dMySqlVarBinary,
  varchar as dMySqlVarChar,
  year as dMySqlYear
} from 'drizzle-orm/mysql-core';
import type {
  bigint as dPgBigInt,
  bigserial as dPgBigSerial,
  boolean as dPgBoolean,
  char as dPgChar,
  date as dPgDate,
  decimal as dPgDecimal,
  doublePrecision as dPgDoublePrecision,
  integer as dPgInteger,
  interval as dPgInterval,
  json as dPgJson,
  jsonb as dPgJsonb,
  line as dPgLine,
  numeric as dPgNumeric,
  point as dPgPoint,
  real as dPgReal,
  serial as dPgSerial,
  smallint as dPgSmallInt,
  smallserial as dPgSmallSerial,
  text as dPgText,
  time as dPgTime,
  timestamp as dPgTimestamp,
  varchar as dPgVarChar
} from 'drizzle-orm/pg-core';
import type {
  blob as dSqliteBlob,
  integer as dSqliteInteger,
  real as dSqliteReal,
  text as dSqliteText
} from 'drizzle-orm/sqlite-core';

type ParametersOfPostgresColumnTypes =
  | Parameters<typeof dPgBigInt>[1]
  | Parameters<typeof dPgBigSerial>[1]
  | Parameters<typeof dPgChar>[1]
  | Parameters<typeof dPgDate>[1]
  | Parameters<typeof dPgDecimal>[1]
  | Parameters<typeof dPgInterval>[1]
  | Parameters<typeof dPgLine>[1]
  | Parameters<typeof dPgNumeric>[1]
  | Parameters<typeof dPgPoint>[1]
  | Parameters<typeof dPgText>[1]
  | Parameters<typeof dPgTime>[1]
  | Parameters<typeof dPgTimestamp>[1]
  | Parameters<typeof dPgVarChar>[1];

type ParametersOfSqliteColumnTypes =
  | Parameters<typeof dSqliteBlob>[1]
  | Parameters<typeof dSqliteInteger>[1]
  | Parameters<typeof dSqliteText>[1];

type ParametersOfMySqlColumnTypes =
  | Parameters<typeof dMySqlBigInt>[1]
  | Parameters<typeof dMySqlBinary>[1]
  | Parameters<typeof dMySqlChar>[1]
  | Parameters<typeof dMySqlDate>[1]
  | Parameters<typeof dMySqlDateTime>[1]
  | Parameters<typeof dMySqlDecimal>[1]
  | Parameters<typeof dMySqlDouble>[1]
  | Parameters<typeof dMySqlEnum>[1]
  | Parameters<typeof dMySqlFloat>[1]
  | Parameters<typeof dMySqlInteger>[1]
  | Parameters<typeof dMySqlMediumInt>[1]
  | Parameters<typeof dMySqlReal>[1]
  | Parameters<typeof dMySqlSmallInt>[1]
  | Parameters<typeof dMySqlText>[1]
  | Parameters<typeof dMySqlTime>[1]
  | Parameters<typeof dMySqlTimestamp>[1]
  | Parameters<typeof dMySqlTinyInt>[1]
  | Parameters<typeof dMySqlVarBinary>[1]
  | Parameters<typeof dMySqlVarChar>[1];

type ReturnTypeOfSqliteColumnTypes =
  | ReturnType<typeof dSqliteBlob>
  | ReturnType<typeof dSqliteInteger>
  | ReturnType<typeof dSqliteReal>;

type ReturnTypeOfMySqlColumnTypes =
  | ReturnType<typeof dMySqlBigInt>
  | ReturnType<typeof dMySqlBinary>
  | ReturnType<typeof dMySqlBoolean>
  | ReturnType<typeof dMySqlChar>
  | ReturnType<typeof dMySqlDate>
  | ReturnType<typeof dMySqlDateTime>
  | ReturnType<typeof dMySqlDecimal>
  | ReturnType<typeof dMySqlDouble>
  | ReturnType<ReturnType<typeof dMySqlEnum>>
  | ReturnType<typeof dMySqlFloat>
  | ReturnType<typeof dMySqlInteger>
  | ReturnType<typeof dMySqlJson>
  | ReturnType<typeof dMySqlMediumInt>
  | ReturnType<typeof dMySqlReal>
  | ReturnType<typeof dMySqlSerial>
  | ReturnType<typeof dMySqlSmallInt>
  | ReturnType<typeof dMySqlText>
  | ReturnType<typeof dMySqlTime>
  | ReturnType<typeof dMySqlTimestamp>
  | ReturnType<typeof dMySqlTinyInt>
  | ReturnType<typeof dMySqlVarBinary>
  | ReturnType<typeof dMySqlVarChar>
  | ReturnType<typeof dMySqlYear>;

type ReturnTypeOfPostgresColumnTypes =
  | ReturnType<typeof dPgBigInt>
  | ReturnType<typeof dPgBigSerial>
  | ReturnType<typeof dPgDate>
  | ReturnType<typeof dPgDecimal>
  | ReturnType<typeof dPgInterval>
  | ReturnType<typeof dPgLine>
  | ReturnType<typeof dPgInteger>
  | ReturnType<typeof dPgBoolean>
  | ReturnType<typeof dPgDoublePrecision>
  | ReturnType<typeof dPgJson>
  | ReturnType<typeof dPgJsonb>
  | ReturnType<typeof dPgReal>
  | ReturnType<typeof dPgSerial>
  | ReturnType<typeof dPgSmallInt>
  | ReturnType<typeof dPgSmallSerial>
  | ReturnType<typeof dPgLine>
  | ReturnType<typeof dPgNumeric>
  | ReturnType<typeof dPgPoint>
  | ReturnType<typeof dPgTime>
  | ReturnType<typeof dPgTimestamp>;

type ParametersOfColumnTypes =
  | ParametersOfPostgresColumnTypes
  | ParametersOfSqliteColumnTypes
  | ParametersOfMySqlColumnTypes;

type ReturnTypeOfColumnTypes =
  | ReturnTypeOfPostgresColumnTypes
  | ReturnTypeOfSqliteColumnTypes
  | ReturnTypeOfMySqlColumnTypes;

export const fieldParser = adapterFieldParser({
  // eslint-disable-next-line ts/require-await
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      any,
      any,
      any,
      any,
      {
        /**
         * If you define a custom type for the column, we will just create a column with the type you defined.
         */
        type?: string;
      } & CustomArgs<ParametersOfColumnTypes, ReturnTypeOfColumnTypes>
    >
  ) => {
    if (args.customAttributes.type)
      return getBuilderArgs(
        {
          type: args.customAttributes.type,
          databaseName: args.field.databaseName as string,
          args: args.customAttributes.args as any
        },
        (defaultBuilderArgs) => defaultBuilderArgs
      )(args.customAttributes.args, args.customAttributes.options);

    if (args.field.dbIndex) {
      args.lazyEvaluate({
        type: 'index',
        indexAttributes: {
          modelName: args.modelName,
          fieldName: args.field.fieldName,
          databaseName: args.field.databaseName,
          unique: args.field.unique
        }
      });
    }

    const fieldData = {
      fieldName: args.field.fieldName,
      primaryKey: args.field.primaryKey,
      unique: args.field.unique,
      nullable: args.field.allowNull,
      dbIndex: args.field.dbIndex,
      default: args.field.defaultValue,
      autoincrement: args.field.isAuto,
      databaseName: args.field.databaseName,
      custom: args.customAttributes
    };
    return fieldData;
  }
});
