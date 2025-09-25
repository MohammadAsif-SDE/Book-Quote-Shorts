"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
dotenv_1.default.config();
const databaseUrl = process.env.DATABASE_URL;
// Support both DATABASE_URL and discrete DB_* env vars
let poolConfig;
const looksLikeUrl = (u) => !!u && /^(postgres(ql)?):\/\//.test(u.trim());
if (looksLikeUrl(databaseUrl)) {
    poolConfig = { connectionString: databaseUrl.trim() };
    // eslint-disable-next-line no-console
    console.log('[db] Using DATABASE_URL connection');
}
else {
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
exports.pool = new pg_1.Pool(poolConfig);
async function query(text, params) {
    return exports.pool.query(text, params);
}
//# sourceMappingURL=db.js.map