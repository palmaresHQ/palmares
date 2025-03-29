import type { Dialect } from "./column-builder.js";
import type { RunnableQuery } from "./runnable-query.js";
export type BatchItem<TDialect extends Dialect = Dialect> = RunnableQuery<any, TDialect>;
export type BatchResponse<T extends BatchItem[] | readonly BatchItem[]> = {
    [K in keyof T]: T[K]['_']['result'];
};
