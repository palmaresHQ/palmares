import {
  adapterGetQuery,
  adapterOrderingQuery,
  adapterQuery,
  adapterRemoveQuery,
  adapterSearchQuery,
  adapterSetQuery
} from '@palmares/databases';
import {
  and,
  asc,
  between,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  not,
  notBetween,
  notIlike,
  notInArray,
  notLike,
  or
} from 'drizzle-orm';

const getQuery = adapterGetQuery({
  // eslint-disable-next-line ts/require-await
  queryData: async (engine, args) => {
    console.log('hitting the DB');
    const selectArgs =
      Array.isArray(args.fields) && args.fields.length > 0
        ? args.fields.reduce((acc, field) => ({ ...acc, [field]: args.modelOfEngineInstance[field] }), {})
        : undefined;
    let query = engine.instance.instance.select(selectArgs).from(args.modelOfEngineInstance);

    if (args.search) {
      const searchAsObjectValues = Object.values(args.search) as any;
      if (searchAsObjectValues.length > 0) query = query.where(and(...searchAsObjectValues));
    }
    if (typeof args.limit === 'number') query = query.limit(args.limit);
    if (typeof args.offset === 'number') query = query.offset(args.offset);
    if ((args.ordering || []).length > 0) query = query.orderBy(...(args.ordering || []));
    return query;
  }
});

const setQuery = adapterSetQuery({
  queryData: async (engine, args) => {
    const engineInstanceOrTransaction = args.transaction || engine.instance.instance;
    return Promise.all(
      args.data.map(async (eachData: any) => {
        if (engine.instance.mainType === 'sqlite' || engine.instance.mainType === 'postgres') {
          if (Object.keys(args.search).length > 0)
            return [
              false,
              await engineInstanceOrTransaction
                .update(args.modelOfEngineInstance)
                .set(eachData)
                .where(and(...(Object.values(args.search) as any)))
                .returning()
            ];
          else
            return [
              true,
              await engineInstanceOrTransaction.insert(args.modelOfEngineInstance).values(eachData).returning()
            ];
        }
      })
    );
  }
});

const removeQuery = adapterRemoveQuery({
  queryData: async (engine, args) => {
    const engineInstanceOrTransaction = args.transaction || engine.instance.instance;

    if (engine.instance.mainType === 'sqlite' || engine.instance.mainType === 'postgres')
      return engineInstanceOrTransaction
        .delete(args.modelOfEngineInstance)
        .where(and(...(Object.values(args.search) as any)))
        .returning();
    else {
      const dataToBeDeleted =
        args.shouldReturnData !== false
          ? await engine.instance.instance
              .select()
              .from(args.modelOfEngineInstance)
              .where(and(...(Object.values(args.search) as any)))
          : [];

      await engineInstanceOrTransaction
        .delete(args.modelOfEngineInstance)
        .where(and(...(Object.values(args.search) as any)));
      return dataToBeDeleted;
    }
  }
});

const order = adapterOrderingQuery({
  // eslint-disable-next-line ts/require-await
  parseOrdering: async (model, ordering) => {
    return ordering.map((order) => {
      const isDescending = order.startsWith('-');
      return isDescending ? desc(model[order.slice(1)]) : asc(model[order]);
    });
  }
});

const search = adapterSearchQuery({
  // eslint-disable-next-line ts/require-await
  parseSearchFieldValue: async (operationType, key, model, value, result, options) => {
    switch (operationType) {
      case 'like': {
        if (options?.ignoreCase) result[key] = ilike(model[key], value as string);
        else if (options?.isNot && options.ignoreCase) result[key] = notIlike(model[key], value as string);
        else if (options?.isNot) result[key] = notLike(model[key], value as string);
        else result[key] = like(model[key], value as string);
        return;
      }
      case 'is':
        if (value === null && options?.isNot) {
          result[key] = isNotNull(model[key]);
          return;
        } else if (value === null) {
          result[key] = isNull(model[key]);
          return;
        } else if (options?.isNot) result[key] = not(eq(model[key], value));
        else result[key] = eq(model[key], value);
        return;
      case 'in':
        if (options?.isNot) result[key] = notInArray(model[key], value as any[]);
        else result[key] = inArray(model[key], value as any[]);
        return;
      case 'between':
        if (options?.isNot) result[key] = notBetween(model[key], value as any[][0], value as any[][1]);
        else result[key] = between(model[key], value as any[][0], value as any[][1]);
        return;
      case 'and':
        result[key] = and(eq(model[key], value), eq(model[key], value));
        return;
      case 'or':
        result[key] = or(eq(model[key], value), eq(model[key], value));
        return;
      case 'greaterThan':
        result[key] = gt(model[key], value);
        return;
      case 'greaterThanOrEqual':
        result[key] = gte(model[key], value);
        return;
      case 'lessThan':
        result[key] = lt(model[key], value);
        return;
      case 'lessThanOrEqual':
        result[key] = lte(model[key], value);
        return;
      default:
        result[key] = eq(model[key], value);
    }
  }
});

export const query = adapterQuery({
  search: new search(),
  ordering: new order(),
  get: new getQuery(),
  set: new setQuery(),
  remove: new removeQuery()
});
