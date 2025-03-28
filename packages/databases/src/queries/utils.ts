import { GetQuerySet, RemoveQuerySet, SetQuerySet } from './queryset';

import type { GetDataFromModel } from './queryset';
import type { DatabaseAdapter } from '../engine';
import type { BaseModel, Model, model } from '../models';
import type { ModelType } from '../models/model';
import type { FieldWithOperationType, onRemoveFunction, onSetFunction } from '../models/types';

export function extractDefaultEventsHandlerFromModel<
  TModel extends InstanceType<ReturnType<typeof model>>,
  TFunctionType extends 'onSet' | 'onRemove'
>(
  modelInstance: TModel,
  functionType: TFunctionType
): (TFunctionType extends 'onSet' ? onSetFunction<TModel> : onRemoveFunction<TModel>) | void {
  if (typeof modelInstance.options?.[functionType] === 'function') {
    return modelInstance.options[functionType] as TFunctionType extends 'onSet'
      ? onSetFunction<TModel>
      : onRemoveFunction<TModel>;
  } else if (
    typeof modelInstance.options?.[functionType] === 'object' &&
    modelInstance.options[functionType].handler === 'function'
  ) {
    return modelInstance.options[functionType].handler as TFunctionType extends 'onSet'
      ? onSetFunction<TModel>
      : onRemoveFunction<TModel>;
  }

  return;
}

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
): Promise<undefined | { isValid: false; code: string; reason: string }> {
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
      const isArrayAndAtLeastOneElement = Array.isArray(fieldData.and) && fieldData.and.length > 1;
      if (isArrayAndAtLeastOneElement) {
        await engine.query.search.parseSearchFieldValue(
          'and',
          key,
          translatedModelInstance,
          await inputFieldParser(fieldData.and),
          result
        );
      } else
        return {
          isValid: false,
          code: 'invalid_in',
          reason: `The field '${key}' must contain at least two elements when using the 'and' clause`
        };
    }

    // OR
    if (fieldData.or !== undefined) {
      const isArrayAndAtLeastTwoElements = Array.isArray(fieldData.or) && fieldData.or.length > 1;

      if (isArrayAndAtLeastTwoElements) {
        await engine.query.search.parseSearchFieldValue(
          'or',
          key,
          translatedModelInstance,
          await inputFieldParser(fieldData.or),
          result
        );
      } else
        return {
          isValid: false,
          code: 'invalid_in',
          reason: `The field '${key}' must contain at least two elements when using the 'or' clause`
        };
    }

    // IN
    if (fieldData.in !== undefined) {
      const isInArrayAndAtLeastOneElement =
        (Array.isArray(fieldData.in) && fieldData.in.length > 0) ||
        (Array.isArray((fieldData.in as any)?.not) && ((fieldData.in as any)?.not || []).length > 0);
      const isInNotArrayAndAtLeastOneElement =
        Array.isArray((fieldData.in as any)?.not) && ((fieldData.in as any)?.not || []).length > 0;

      if (isInArrayAndAtLeastOneElement) {
        await engine.query.search.parseSearchFieldValue(
          'in',
          key,
          translatedModelInstance,
          // eslint-disable-next-line ts/no-unnecessary-condition
          await Promise.all(((fieldData.in || []) as any[]).map((inValue) => inputFieldParser(inValue))),
          result
        );
      } else if (isInNotArrayAndAtLeastOneElement) {
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
      } else
        return {
          isValid: false,
          code: 'invalid_in',
          reason: `The field '${key}' must contain at least one element when using the 'in' clause`
        };
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
      } else
        return {
          isValid: false,
          code: 'invalid_between',
          reason: `The field '${key}' must have exactly two elements when using the 'between' clause`
        };
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

/**
 * Retrieves a QuerySet instance based on the type of query you want to perform.
 *
 * If you are looking to perform a 'set' query, you should pass 'set' as the type.
 * If you are looking to perform a 'remove' query, you should pass 'remove' as the type.
 * Last but not least, if you are looking to perform a 'get' query, you should pass 'get' as the type or leave it empty.
 *
 * @param model The model you want to perform the query on.
 * @param type The type of query you want to perform.
 *
 * @returns A QuerySet instance based on the type of query you want to perform.
 */
export function queryset<TModel, TType extends 'set' | 'remove' | 'get' = 'get'>(
  model: TModel,
  type: TType = 'get' as TType
): TType extends 'remove'
  ? RemoveQuerySet<
      'remove',
      TModel,
      GetDataFromModel<TModel, 'read'>,
      Partial<GetDataFromModel<TModel, 'update'>>,
      GetDataFromModel<TModel, 'create'>,
      Partial<GetDataFromModel<TModel, 'read', true>>,
      GetDataFromModel<TModel>,
      false,
      false,
      false,
      false,
      never
    >
  : TType extends 'set'
    ? SetQuerySet<
        'set',
        TModel,
        GetDataFromModel<TModel, 'read'>,
        Partial<GetDataFromModel<TModel, 'update'>>,
        GetDataFromModel<TModel, 'create'>,
        Partial<GetDataFromModel<TModel, 'read', true>>,
        GetDataFromModel<TModel>,
        false,
        false,
        false,
        false,
        never
      >
    : GetQuerySet<
        'get',
        TModel,
        GetDataFromModel<TModel, 'read'>,
        Partial<GetDataFromModel<TModel, 'update'>>,
        GetDataFromModel<TModel, 'create'>,
        Partial<GetDataFromModel<TModel, 'read', true>>,
        GetDataFromModel<TModel>,
        false,
        false,
        false,
        false,
        never
      > {
  if (type === 'set') return new SetQuerySet(model, 'set') as any;
  if (type === 'remove') return new RemoveQuerySet(model, 'remove') as any;
  return new GetQuerySet(model, 'get') as any;
}
