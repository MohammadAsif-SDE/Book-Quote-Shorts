import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

// Support both DATABASE_URL and discrete DB_* env vars
let poolConfig: any;
const looksLikeUrl = (u?: string) => !!u && /^(postgres(ql)?):\/\//.test(u.trim());
if (looksLikeUrl(databaseUrl)) {
  poolConfig = { connectionString: databaseUrl!.trim() };
  // eslint-disable-next-line no-console
  console.log('[db] Using DATABASE_URL connection');
} else {
  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
  const database = process.env.DB_NAME ?? process.env.POSTGRES_DB ?? undefined;
  const user = process.env.DB_USER ?? process.env.POSTGRES_USER ?? undefined;
  const passwordRaw = process.env.DB_PASSWORD ?? process.env.POSTGRES_PASSWORD ?? undefined;
  const password = typeof passwordRaw === 'string' ? passwordRaw : undefined;

  if (!database || !user) {
    throw new Error('Database configuration is missing. Provide DATABASE_URL or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD');
  }
  if (!password || password.length === 0) {
    throw new Error('DB_PASSWORD is required and must be a non-empty string');
  }

  poolConfig = { host, port, database, user, password, ssl: false };
  // eslint-disable-next-line no-console
  console.log(`[db] Using discrete env vars: host=${host}, port=${port}, db=${database}, user=${user}`);
}

export const pool = new Pool(poolConfig);

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[] }>{
  return pool.query<T>(text, params as any);
}


