import DatabaseAdapter from '../engine';
import { BaseModel, model } from '../models';
import { FieldWithOperationType } from '../models/types';

/**
 * What this will do is parse the search FIELD, for every field we see if it is of type object, if it is we parse it for the query.
 *
 * Parse means we send the value, the type of operation, if it's a negative and an object to append the result of the parse.
 *
 * We return either the value of the field or the object with the parsed data.
 */
async function parseSearchField(
  engine: DatabaseAdapter,
  fieldData: FieldWithOperationType<unknown>,
  inputFieldParser: (value: any) => Promise<any>
) {
  if (typeof fieldData === 'object') {
    const dataOfFieldToUseInQuery: any = {};

    if (typeof fieldData?.like === 'object') {
      if ((fieldData?.like as any)?.ignoreCase) {
        await engine.query.search.parseSearchFieldValue(
          'like',
          await inputFieldParser((fieldData?.like as any)?.ignoreCase),
          dataOfFieldToUseInQuery,
          {
            ignoreCase: true,
          }
        );
      }
      if ('not' in fieldData.like) {
        if (typeof fieldData?.like?.not === 'object') {
          await engine.query.search.parseSearchFieldValue(
            'like',
            await inputFieldParser((fieldData?.like?.not as any).ignoreCase),
            dataOfFieldToUseInQuery,
            {
              isNot: true,
              ignoreCase: true,
            }
          );
        } else {
          await engine.query.search.parseSearchFieldValue(
            'like',
            await inputFieldParser(fieldData?.like.not),
            dataOfFieldToUseInQuery,
            {
              isNot: true,
            }
          );
        }
      } else {
        await engine.query.search.parseSearchFieldValue(
          'like',
          await inputFieldParser(fieldData?.like),
          dataOfFieldToUseInQuery
        );
      }
    }
    if (Array.isArray(fieldData?.and)) {
      await engine.query.search.parseSearchFieldValue(
        'and',
        await inputFieldParser(fieldData?.and),
        dataOfFieldToUseInQuery
      );
    }
    if (Array.isArray(fieldData?.or)) {
      await engine.query.search.parseSearchFieldValue(
        'or',
        await inputFieldParser(fieldData?.or),
        dataOfFieldToUseInQuery
      );
    }
    if (Array.isArray(fieldData?.in)) {
      await engine.query.search.parseSearchFieldValue(
        'in',
        await inputFieldParser(fieldData?.in),
        dataOfFieldToUseInQuery
      );
    } else if (typeof fieldData?.in === 'object') {
      await engine.query.search.parseSearchFieldValue(
        'in',
        await inputFieldParser(fieldData?.in.not),
        dataOfFieldToUseInQuery,
        {
          isNot: true,
        }
      );
    }
    if (Array.isArray(fieldData?.between)) {
      await engine.query.search.parseSearchFieldValue(
        'between',
        await inputFieldParser(fieldData?.between),
        dataOfFieldToUseInQuery
      );
    } else if (typeof fieldData?.between === 'object') {
      await engine.query.search.parseSearchFieldValue(
        'between',
        await inputFieldParser(fieldData?.between.not),
        dataOfFieldToUseInQuery,
        {
          isNot: true,
        }
      );
    }
    if (fieldData?.is !== undefined) {
      await engine.query.search.parseSearchFieldValue(
        'is',
        await inputFieldParser(fieldData?.is),
        dataOfFieldToUseInQuery
      );
    } else if (typeof fieldData?.is === 'object')
      await engine.query.search.parseSearchFieldValue(
        'is',
        await inputFieldParser((fieldData?.is as any).not),
        dataOfFieldToUseInQuery,
        {
          isNot: true,
        }
      );
    if (fieldData?.greaterThan !== undefined)
      await engine.query.search.parseSearchFieldValue(
        'greaterThan',
        await inputFieldParser(fieldData?.greaterThan),
        dataOfFieldToUseInQuery
      );
    if (fieldData?.greaterThanOrEqual !== undefined)
      await engine.query.search.parseSearchFieldValue(
        'greaterThanOrEqual',
        await inputFieldParser(fieldData?.greaterThanOrEqual),
        dataOfFieldToUseInQuery
      );
    if (fieldData?.lessThan !== undefined)
      await engine.query.search.parseSearchFieldValue(
        'lessThan',
        await inputFieldParser(fieldData?.lessThan),
        dataOfFieldToUseInQuery
      );
    if (fieldData?.lessThanOrEqual !== undefined)
      await engine.query.search.parseSearchFieldValue(
        'lessThanOrEqual',
        await inputFieldParser(fieldData?.lessThanOrEqual),
        dataOfFieldToUseInQuery
      );

    return dataOfFieldToUseInQuery;
  }
  return fieldData;
}

/**
 * The search parser is used to parse the search that we will use to query the database, with this we are able to remove the fields
 * that are not in the model, and also translate queries like `in`, `not in` and so on
 *
 * @param modelInstance - The model instance to use to parse the search.
 * @param search - The search to parse.
 *
 * @returns The parsed search, translated to the database engine so we can make a query.
 */
export default async function parseSearch(
  engine: DatabaseAdapter,
  modelInstance: InstanceType<ReturnType<typeof model>>,
  search: any,
  useInputParser: boolean = true
) {
  if (search) {
    const modelConstructor = modelInstance.constructor as ReturnType<typeof model> & typeof BaseModel;
    const fieldsInModelInstance = Object.keys(modelInstance.fields);
    const fieldsInSearch = Object.keys(search);

    const formattedSearch: Record<string, any> = {};
    const promises = fieldsInSearch.map(async (key) => {
      const fieldInputParserFunction =
        useInputParser && modelInstance.fields[key]?.inputParsers.has(engine.connectionName)
          ? async (value: any) =>
              modelInstance.fields[key]?.inputParsers.get(engine.connectionName)?.({
                engine,
                field: modelInstance.fields[key],
                fieldParser: engine.fields.fieldsParser,
                model: modelInstance,
                modelName: modelConstructor.getName(),
                value,
              })
          : async (value: any) => value;
      if (fieldsInModelInstance.includes(key))
        formattedSearch[key] = await parseSearchField(engine, search[key], fieldInputParserFunction);
    });
    await Promise.all(promises);
    return formattedSearch;
  }
  return {};
}
