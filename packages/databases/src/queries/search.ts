import Engine from '../engine';
import { BaseModel } from '../models';
import { FieldWithOperationType, OperatorsOfQuery } from '../models/types';

/**
 * What this will do is parse the search FIELD, for every field we see if it is of type object, if it is we parse it for the query.
 *
 * Parse means we send the value, the type of operation, if it's a negative and an object to append the result of the parse.
 *
 * We return either the value of the field or the object with the parsed data.
 */
async function parseSearchField(engine: Engine, fieldData: FieldWithOperationType<unknown>) {
  if (typeof fieldData === 'object') {
    const dataOfFieldToUseInQuery: any = {};

    if (typeof fieldData?.like === 'object') {
      if ((fieldData?.like as any)?.ignoreCase) {
        await engine.query.search.parseSearchFieldValue(
          OperatorsOfQuery.like,
          (fieldData?.like as any)?.ignoreCase,
          dataOfFieldToUseInQuery,
          {
            ignoreCase: true,
          }
        );
      }
      if ('not' in fieldData.like) {
        if (typeof fieldData?.like?.not === 'object') {
          await engine.query.search.parseSearchFieldValue(
            OperatorsOfQuery.like,
            (fieldData?.like?.not as any).ignoreCase,
            dataOfFieldToUseInQuery,
            {
              isNot: true,
              ignoreCase: true,
            }
          );
        } else {
          await engine.query.search.parseSearchFieldValue(
            OperatorsOfQuery.like,
            fieldData?.like.not,
            dataOfFieldToUseInQuery,
            {
              isNot: true,
            }
          );
        }
      } else {
        await engine.query.search.parseSearchFieldValue(
          OperatorsOfQuery.like,
          fieldData?.like,
          dataOfFieldToUseInQuery
        );
      }
    }
    if (Array.isArray(fieldData?.and)) {
      await engine.query.search.parseSearchFieldValue(OperatorsOfQuery.and, fieldData?.and, dataOfFieldToUseInQuery);
    }
    if (Array.isArray(fieldData?.or)) {
      await engine.query.search.parseSearchFieldValue(OperatorsOfQuery.or, fieldData?.or, dataOfFieldToUseInQuery);
    }
    if (Array.isArray(fieldData?.in)) {
      await engine.query.search.parseSearchFieldValue(OperatorsOfQuery.in, fieldData?.in, dataOfFieldToUseInQuery);
    } else if (typeof fieldData?.in === 'object') {
      await engine.query.search.parseSearchFieldValue(OperatorsOfQuery.in, fieldData?.in.not, dataOfFieldToUseInQuery, {
        isNot: true,
      });
    }
    if (Array.isArray(fieldData?.between)) {
      await engine.query.search.parseSearchFieldValue(
        OperatorsOfQuery.between,
        fieldData?.between,
        dataOfFieldToUseInQuery
      );
    } else if (typeof fieldData?.between === 'object') {
      await engine.query.search.parseSearchFieldValue(
        OperatorsOfQuery.between,
        fieldData?.between.not,
        dataOfFieldToUseInQuery,
        {
          isNot: true,
        }
      );
    }
    if (fieldData?.is !== undefined) {
      await engine.query.search.parseSearchFieldValue(OperatorsOfQuery.is, fieldData?.is, dataOfFieldToUseInQuery);
    } else if (typeof fieldData?.is === 'object')
      await engine.query.search.parseSearchFieldValue(
        OperatorsOfQuery.is,
        (fieldData?.is as any).not,
        dataOfFieldToUseInQuery,
        {
          isNot: true,
        }
      );
    if (fieldData?.greaterThan !== undefined)
      await engine.query.search.parseSearchFieldValue(
        OperatorsOfQuery.greaterThan,
        fieldData?.greaterThan,
        dataOfFieldToUseInQuery
      );
    if (fieldData?.greaterThanOrEqual !== undefined)
      await engine.query.search.parseSearchFieldValue(
        OperatorsOfQuery.greaterThanOrEqual,
        fieldData?.greaterThanOrEqual,
        dataOfFieldToUseInQuery
      );
    if (fieldData?.lessThan !== undefined)
      await engine.query.search.parseSearchFieldValue(
        OperatorsOfQuery.lessThan,
        fieldData?.lessThan,
        dataOfFieldToUseInQuery
      );
    if (fieldData?.lessThanOrEqual !== undefined)
      await engine.query.search.parseSearchFieldValue(
        OperatorsOfQuery.lessThanOrEqual,
        fieldData?.lessThanOrEqual,
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
export default async function parseSearch(engine: Engine, modelInstance: BaseModel<any>, search: any) {
  if (search) {
    const fieldsInModelInstance = Object.keys(modelInstance.fields);
    const fieldsInSearch = Object.keys(search);

    const formattedSearch: Record<string, any> = {};
    const promises = fieldsInSearch.map(async (key) => {
      if (fieldsInModelInstance.includes(key)) formattedSearch[key] = await parseSearchField(engine, search[key]);
    });
    await Promise.all(promises);
    return formattedSearch;
  }
  return {};
}
