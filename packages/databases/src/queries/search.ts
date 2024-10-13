import type { DatabaseAdapter } from '../engine';
import type { model } from '../models';
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
export async function parseSearchField(
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

    // LIKE
    if (fieldData.like !== undefined) {
      await engine.query.search.parseSearchFieldValue(
        'like',
        key,
        translatedModelInstance,
        await inputFieldParser(fieldData.like),
        result
      );
    }

    // AND
    if (fieldData.and !== undefined) {
      const isArrayAndBiggerThanOneElement = Array.isArray(fieldData.and) && fieldData.and.length > 1;
      if (isArrayAndBiggerThanOneElement) {
        await engine.query.search.parseSearchFieldValue(
          'and',
          key,
          translatedModelInstance,
          await inputFieldParser(fieldData.and),
          result
        );
      } else return false;
    }

    // OR
    if (fieldData.or !== undefined) {
      const isArrayAndBiggerThanOneElement = Array.isArray(fieldData.or) && fieldData.or.length > 1;

      if (isArrayAndBiggerThanOneElement) {
        await engine.query.search.parseSearchFieldValue(
          'or',
          key,
          translatedModelInstance,
          await inputFieldParser(fieldData.or),
          result
        );
      } else return false;
    }

    // IN
    if (fieldData.in !== undefined) {
      const isInArrayAndBiggerThanOneElement =
        (Array.isArray(fieldData.in) && fieldData.in.length > 1) ||
        (Array.isArray((fieldData.in as any)?.not) && ((fieldData.in as any)?.not || []).length > 1);
      const isInNotArrayAndBiggerThanOneElement =
        Array.isArray((fieldData.in as any)?.not) && ((fieldData.in as any)?.not || []).length > 1;
      if (isInArrayAndBiggerThanOneElement) {
        await engine.query.search.parseSearchFieldValue(
          'in',
          key,
          translatedModelInstance,
          // eslint-disable-next-line ts/no-unnecessary-condition
          await Promise.all(((fieldData.in || []) as any[]).map((inValue) => inputFieldParser(inValue))),
          result
        );
      } else if (isInNotArrayAndBiggerThanOneElement) {
        await engine.query.search.parseSearchFieldValue(
          'in',
          key,
          translatedModelInstance,
          // eslint-disable-next-line ts/no-unnecessary-condition
          await Promise.all((((fieldData.in as any)?.not || []) as any[]).map((inValue) => inputFieldParser(inValue))),
          result,
          {
            isNot: true
          }
        );
      } else return false;
    }

    // BETWEEN
    if (fieldData.between !== undefined) {
      const isBetweenAnArrayAndExactlyTwoElements =
        // eslint-disable-next-line ts/no-unnecessary-condition
        Array.isArray(fieldData.between) && fieldData.between.length === 2;

      const isBetweenNotAnArrayAndExactlyTwoElements =
        Array.isArray((fieldData.between as any)?.not) && ((fieldData.between as any)?.not || []).length === 2;

      if (isBetweenAnArrayAndExactlyTwoElements) {
        await engine.query.search.parseSearchFieldValue(
          'between',
          key,
          translatedModelInstance,
          // eslint-disable-next-line ts/no-unnecessary-condition
          await Promise.all(((fieldData.between || []) as any[]).map((betweenValue) => inputFieldParser(betweenValue))),
          result
        );
      } else if (isBetweenNotAnArrayAndExactlyTwoElements) {
        await engine.query.search.parseSearchFieldValue(
          'between',
          key,
          translatedModelInstance,
          // eslint-disable-next-line ts/no-unnecessary-condition
          await Promise.all(
            (((fieldData.between as any)?.not || []) as any[]).map((betweenValue) => inputFieldParser(betweenValue))
          ),
          result,
          {
            isNot: true
          }
        );
      } else return false;
    }

    // IS
    if (fieldData.is && (fieldData.is as any).not !== undefined) {
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
    } else if (fieldData.is !== undefined)
      await engine.query.search.parseSearchFieldValue(
        'is',
        key,
        translatedModelInstance,
        await inputFieldParser(fieldData.is),
        result
      );

    // GREATER THAN
    if (fieldData.greaterThan && (fieldData.greaterThan as any).equal !== undefined) {
      await engine.query.search.parseSearchFieldValue(
        'greaterThan',
        key,
        translatedModelInstance,
        await inputFieldParser((fieldData.greaterThan as any).equal),
        result,
        {
          equals: true
        }
      );
    } else if (fieldData.greaterThan !== undefined)
      await engine.query.search.parseSearchFieldValue(
        'greaterThan',
        key,
        translatedModelInstance,
        await inputFieldParser(fieldData.greaterThan),
        result
      );

    // LESS THAN
    if (fieldData.lessThan && (fieldData.lessThan as any).equal !== undefined) {
      await engine.query.search.parseSearchFieldValue(
        'lessThan',
        key,
        translatedModelInstance,
        await inputFieldParser(fieldData.lessThan),
        result,
        {
          equals: true
        }
      );
    } else if (fieldData.lessThan !== undefined)
      await engine.query.search.parseSearchFieldValue(
        'lessThan',
        key,
        translatedModelInstance,
        await inputFieldParser((fieldData.lessThan as any).equal),
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
