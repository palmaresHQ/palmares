import { adapterGetQuery, adapterOrderingQuery, adapterQuery, adapterRemoveQuery, adapterSearchQuery, adapterSetQuery } from "@palmares/databases";
import {
  and,
  between,
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
  or,
  desc,
  asc
} from "drizzle-orm";

const getQuery = adapterGetQuery({
  queryData: async (engine, args) => {
    return engine.instance.instance.select()
    .from(args.modelOfEngineInstance)
    .where(and(...Object.values(args.search) as any))
    .orderBy(...(args.ordering || []));
  }
})

const setQuery = adapterSetQuery({
  queryData: async (engine, args) => {
    const engineInstanceOrTransaction = args.transaction || engine.instance.instance;
    return Promise.all(
      args.data.map(async (eachData: any) => {
        if (engine.instance.mainType === 'sqlite' || engine.instance.mainType === 'postgres') {
          if (Object.keys(args.search).length > 0) return [
            false,
            (await engineInstanceOrTransaction
              .update(args.modelOfEngineInstance)
              .set(eachData)
              .where(
                and(...Object.values(args.search) as any)
              ).returning())];
          else return [true, (await engineInstanceOrTransaction.insert(args.modelOfEngineInstance).values(eachData).returning())]
        }
      })
    );
  }
});

const removeQuery = adapterRemoveQuery({
  queryData: async (engine, args) => {
    const engineInstanceOrTransaction = args.transaction || engine.instance.instance;

    if (engine.instance.mainType === 'sqlite' || engine.instance.mainType === 'postgres')
      return engineInstanceOrTransaction.delete(args.modelOfEngineInstance).where(args.search).returning();
    else {
      const dataToBeDeleted = args.shouldReturnData !== false ? await engine.instance.instance.select()
        .from(args.modelOfEngineInstance)
        .where(and(...Object.values(args.search) as any))
        : [];

      await engineInstanceOrTransaction.delete(args.modelOfEngineInstance).where(args.search);
      return dataToBeDeleted;
    }
  }
});

const order = adapterOrderingQuery({
  parseOrdering: async (model, ordering) => {
    return ordering.map((order) => {
      const isDescending = order.startsWith('-');
      return isDescending ? desc(model[order.slice(1)] as any) : asc(model[order] as any);
    });
  }
});

const search = adapterSearchQuery({
  parseSearchFieldValue: async (
    operationType,
    key,
    model,
    value,
    result,
    options
  ) => {
    switch (operationType) {
      case 'like':
        if (options?.ignoreCase) result[key] = ilike(model[key] as any, value as string);
        else if (options?.isNot && options.ignoreCase) result[key] = notIlike(model[key] as any, value as string);
        else if (options?.isNot) result[key] = notLike(model[key] as any, value as string);
        else result[key] = like(model[key] as any, value as string);
        return;
      case 'is':
        if (value === null && options?.isNot)
          result[key] = isNotNull(model[key] as any);
        else if (value === null)
          result[key] = isNull(model[key] as any);
        else if (options?.isNot)
          result[key] = not(eq(model[key] as any, value));
        else
          result[key] = eq(model[key] as any, value);
        return;
      case 'in':
        if (options?.isNot)
          result[key] = notInArray(model[key] as any, value as any[]);
        else
          result[key] = inArray(model[key] as any, value as any[]);
        return;
      case 'between':
        if (options?.isNot)
          result[key] = notBetween(model[key] as any, value as any[][0], value as any[][1])
        else
          result[key] = between(model[key] as any, value as any[][0], value as any[][1]);
        return;
      case 'and':
        result[key] = and(eq(model[key] as any, value), eq(model[key] as any, value));
        return;
      case 'or':
        result[key] = or(eq(model[key] as any, value), eq(model[key] as any, value));
        return;
      case 'greaterThan':
        result[key] = gt(model[key] as any, value);
        return;
      case 'greaterThanOrEqual':
        result[key] = gte(model[key] as any, value);
        return;
      case 'lessThan':
        result[key] = lt(model[key] as any, value);
        return;
      case 'lessThanOrEqual':
        result[key] = lte(model[key] as any, value);
        return;
      default:
        result[key] = eq(model[key] as any, value);
    }
  }
})

export default adapterQuery({
  search: new search(),
  ordering: new order(),
  get: new getQuery(),
  set: new setQuery(),
  remove: new removeQuery()
})
