import { entityKind } from "./entity.js";
import type { SQL, SQLWrapper } from "./sql/sql.js";
export interface Subquery<TAlias extends string = string, TSelectedFields extends Record<string, unknown> = Record<string, unknown>> extends SQLWrapper {
}
export declare class Subquery<TAlias extends string = string, TSelectedFields extends Record<string, unknown> = Record<string, unknown>> implements SQLWrapper {
    static readonly [entityKind]: string;
    _: {
        brand: 'Subquery';
        sql: SQL;
        selectedFields: TSelectedFields;
        alias: TAlias;
        isWith: boolean;
    };
    constructor(sql: SQL, selection: Record<string, unknown>, alias: string, isWith?: boolean);
}
export declare class WithSubquery<TAlias extends string = string, TSelection extends Record<string, unknown> = Record<string, unknown>> extends Subquery<TAlias, TSelection> {
    static readonly [entityKind]: string;
}
export type WithSubqueryWithoutSelection<TAlias extends string> = WithSubquery<TAlias, {}>;
