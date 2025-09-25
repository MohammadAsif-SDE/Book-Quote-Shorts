import { Pool, type QueryResultRow } from 'pg';
export declare const pool: Pool;
export declare function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<{
    rows: T[];
}>;
//# sourceMappingURL=db.d.ts.map