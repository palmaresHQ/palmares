import type { DatabaseAdapter } from '../engine';
import type { BaseModel, model } from '../models';
import type { FieldWithOperationType } from '../models/types';

/**
 * What this will do is parse the search FIELD, for every field we see if it is
 * of type object, if it is we parse it for the query.
 *
 * Parse means we send the value, the type of operation, if it's a negative and
 * an object to append the result of the parse.
 *
 * We return either the value of the field or the object with the parsed data.
 */
async function parseSearchField(
  engine: DatabaseAdapter,
  key: string,
  fieldData: FieldWithOperationType<unknown>,
  inputFieldParser: (value: any) => Promise<any>,
  translatedModelInstance: InstanceType<ReturnType<typeof model>>,
  result: any
) {
  // eslint-disable-next-line ts/no-unnecessary-condition
  if (typeof fieldData === 'object' && fieldData !== null) {
    if (typeof fieldData.like === 'object') {
      if ((fieldData.like as any)?.ignoreCase) {
        await engine.query.search.parseSearchFieldValue(
          'like',
          key,
          translatedModelInstance,
          await inputFieldParser((fieldData.like as any)?.ignoreCase),
          result,
          {
            ignoreCase: true
          }
        );
      } else if ('not' in fieldData.like) {
        if (typeof fieldData.like.not === 'object') {
          await engine.query.search.parseSearchFieldValue(
            'like',
            key,
            translatedModelInstance,
            await inputFieldParser((fieldData.like.not as any).ignoreCase),
            result,
            {
              isNot: true,
              ignoreCase: true
            }
          );
        } else {
          await engine.query.search.parseSearchFieldValue(
            'like',
            key,
            translatedModelInstance,
            await inputFieldParser(fieldData.like.not),
            result,
            {
              isNot: true
            }
          );
        }
      }
    }

    if (typeof fieldData.like === 'string') {
      await engine.query.search.parseSearchFieldValue(
        'like',
        key,
        translatedModelInstance,
        await inputFieldParser(fieldData.like),
        result
      );
    }

    if (Array.isArray(fieldData.and)) {
      await engine.query.search.parseSearchFieldValue(
        'and',
        key,
        translatedModelInstance,
        await inputFieldParser(fieldData.and),
        result
      );
    }
    if (Array.isArray(fieldData.or)) {
      await engine.query.search.parseSearchFieldValue(
        'or',
        key,
        translatedModelInstance,
        await inputFieldParser(fieldData.or),
        result
      );
    }
    if (Array.isArray(fieldData.in)) {
      await engine.query.search.parseSearchFieldValue(
        'in',
        key,
        translatedModelInstance,
        // eslint-disable-next-line ts/no-unnecessary-condition
        await Promise.all((fieldData.in || []).map((inValue) => inputFieldParser(inValue))),
        result
      );
    } else if (typeof fieldData.in === 'object') {
      await engine.query.search.parseSearchFieldValue(
        'in',
        key,
        translatedModelInstance,
        // eslint-disable-next-line ts/no-unnecessary-condition
        await Promise.all((fieldData.in.not || []).map((inValue) => inputFieldParser(inValue))),
        result,
        {
          isNot: true
        }
      );
    }
    if (Array.isArray(fieldData.between)) {
      await engine.query.search.parseSearchFieldValue(
        'between',
        key,
        translatedModelInstance,
        // eslint-disable-next-line ts/no-unnecessary-condition
        await Promise.all((fieldData.between || []).map((betweenValue) => inputFieldParser(betweenValue))),
        result
      );
    } else if (typeof fieldData.between === 'object') {
      await engine.query.search.parseSearchFieldValue(
        'between',
        key,
        translatedModelInstance,
        // eslint-disable-next-line ts/no-unnecessary-condition
        await Promise.all((fieldData.between.not || []).map((betweenValue) => inputFieldParser(betweenValue))),
        result,
        {
          isNot: true
        }
      );
    }
    if (fieldData.is !== undefined) {
      await engine.query.search.parseSearchFieldValue(
        'is',
        key,
        translatedModelInstance,
        await inputFieldParser(fieldData.is),
        result
      );
    } else if (typeof fieldData.is === 'object')
      await engine.query.search.parseSearchFieldValue(
        'is',
        key,
        translatedModelInstance,
        await inputFieldParser((fieldData.is as any).not),
        result,
        {
          isNot: true
        }
      );
    if (fieldData.greaterThan !== undefined)
      await engine.query.search.parseSearchFieldValue(
        'greaterThan',
        key,
        translatedModelInstance,
        await inputFieldParser(fieldData.greaterThan),
        result
      );
    if (fieldData.greaterThanOrEqual !== undefined)
      await engine.query.search.parseSearchFieldValue(
        'greaterThanOrEqual',
        key,
        translatedModelInstance,
        await inputFieldParser(fieldData.greaterThanOrEqual),
        result
      );
    if (fieldData.lessThan !== undefined)
      await engine.query.search.parseSearchFieldValue(
        'lessThan',
        key,
        translatedModelInstance,
        await inputFieldParser(fieldData.lessThan),
        result
      );
    if (fieldData.lessThanOrEqual !== undefined)
      await engine.query.search.parseSearchFieldValue(
        'lessThanOrEqual',
        key,
        translatedModelInstance,
        await inputFieldParser(fieldData.lessThanOrEqual),
        result
      );
    return;
  }
  return await engine.query.search.parseSearchFieldValue(
    'eq',
    key,
    translatedModelInstance,
    await inputFieldParser(fieldData),
    result
  );
}

/**
 * The search parser is used to parse the search that we will use to query the database,
 * with this we are able to remove the fields
 * that are not in the model, and also translate queries like `in`, `not in` and so on
 *
 * @param modelInstance - The model instance to use to parse the search.
 * @param search - The search to parse.
 *
 * @returns The parsed search, translated to the database engine so we can make a query.
 */
export async function parseSearch(
  engine: DatabaseAdapter,
  modelInstance: InstanceType<ReturnType<typeof model>>,
  translatedModelInstance: any,
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
        useInputParser && modelInstance.fields[key].inputParsers.has(engine.connectionName)
          ? async (value: any) =>
              modelInstance.fields[key].inputParsers.get(engine.connectionName)?.({
                engine,
                field: modelInstance.fields[key],
                fieldParser: engine.fields.fieldsParser,
                model: modelInstance,
                modelName: modelConstructor.getName(),
                value
              })
          : // eslint-disable-next-line ts/require-await
            async (value: any) => value;
      if (fieldsInModelInstance.includes(key))
        await parseSearchField(
          engine,
          key,
          search[key],
          fieldInputParserFunction,
          translatedModelInstance,
          formattedSearch
        );
    });
    await Promise.all(promises);
    return formattedSearch;
  }
  return search || {};
}
