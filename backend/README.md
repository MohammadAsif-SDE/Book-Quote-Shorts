# Backend - Book Quote Shorts

## Environment
Create `.env` in `backend/`:

```
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173

# Option A: Single URL
# DATABASE_URL=postgres://user:password@localhost:5432/book_quotes

# Option B: Discrete variables
DB_HOST=localhost
DB_PORT=5432
DB_NAME=book_quotes
DB_USER=postgres
DB_PASSWORD=admin@321///
```

## Database
Run the schema and seeds in your PostgreSQL manually:

- Schema: `sql/schema.sql`
- Seed: `sql/seed.sql`

Example psql:

```
createdb book_quotes
psql book_quotes -f sql/schema.sql
psql book_quotes -f sql/seed.sql
```

## Install and Run
```
npm install
npm run dev
```

### Build / Start
```
npm run build
npm start
```

## API
- `GET /api/quotes?page=1&limit=20` → `{ page, limit, items: Quote[] }`
- `POST /api/quotes/:id/like` → `{ likes: number }`
