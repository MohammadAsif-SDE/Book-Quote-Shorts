# Book Quote Shorts

A small web app that plays short book quotes like reels/shorts. It includes a Node.js + Express + PostgreSQL backend and a React + Vite frontend with smooth transitions, autoplay, navigation, likes, and an optional external quotes source.

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+ (local or remote)

### 1) Backend setup

1. Create a PostgreSQL database (example: `book_quotes`).
2. In `backend/`, create `.env` with either a single `DATABASE_URL` or discrete variables:

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
DB_PASSWORD=your_password
```

3. Apply schema and seed data:

```bash
cd backend
npm install
psql -d book_quotes -f sql/schema.sql
psql -d book_quotes -f sql/seed.sql
npm run dev
```

The backend will start on `http://localhost:4000`.

### 2) Frontend setup

1. In `frontend/`, optionally create `.env` to point at the backend API:

```
VITE_API_BASE=http://localhost:4000/api
```

2. Install and run:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## Project Structure

```
/ (repo root)
  backend/
    src/
      server.ts           # Express app and routes wiring
      db.ts               # PostgreSQL pool + query helper
      routes/
        quotes.ts         # GET /api/quotes, POST /api/quotes/:id/like
    sql/
      schema.sql          # Tables: authors, books, quotes
      seed.sql            # Sample authors/books/quotes
    package.json          # scripts: dev, build, start

  frontend/
    src/
      api.ts              # Client for local API + external Recite API
      App.tsx             # Core viewer UX: autoplay, navigation, toggles
      App.css             # Global styles + control bar + tooltip styles
      components/
        QuoteCard.tsx     # Quote display + like/share actions
        QuoteCard.css     # Card transitions and responsive styles
    package.json          # scripts: dev, build, preview
```

---

## Features
- Display short quotes with author and book title
- Reel-like viewer with smooth transitions (Framer Motion)
- Navigation by click/tap; autoplay with pause/resume
- Like button (local quotes only)
- Simple share mock (toast)
- Toggle between local backend quotes and external Recite API quotes
- Responsive layout

## Screenshots

![External API view](Assets/book_quote_api.png)

![Local quotes view](Assets/book_quote.png)

---

## Backend Overview

- Framework: Express
- Language: TypeScript
- DB: PostgreSQL via `pg`
- Validation: `zod`
- CORS: enabled only for `FRONTEND_ORIGIN`

### API Endpoints
- `GET /api/quotes?page=1&limit=20`
  - Returns `{ page, limit, items: Quote[] }`
  - Items ordered by `created_at DESC`
- `POST /api/quotes/:id/like`
  - Increments and returns `{ likes }` for the given quote id
- `GET /health` → `{ status: 'ok' }`

Quote shape from backend:
```ts
{
  id: number,
  text: string,
  author_name: string,
  book_title: string,
  likes: number,
  created_at: string
}
```

### Database Schema
Tables defined in `backend/sql/schema.sql`:
- `authors(id, name)`
- `books(id, title, author_id)`
- `quotes(id, author_id, book_id, text, likes, created_at)`

Seed data in `backend/sql/seed.sql` adds authors, books, and several quotes.

### Environment
`backend/.env` supports:
- `PORT` (default 4000)
- `FRONTEND_ORIGIN` (default `http://localhost:5173`)
- Either `DATABASE_URL` or discrete `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

---

## Frontend Overview

- Framework: React 19 + Vite
- Animations: Framer Motion
- Styling: CSS files (no CSS-in-JS)

### Behavior
- Loads quotes from either:
  - Local backend (`VITE_API_BASE`, default `http://localhost:4000/api`)
  - External Recite API (`https://recite.onrender.com/api/v1`)
- Toggle source using the left control button in the bottom control bar.
- Autoplay advances every ~3.5s; tap/click the viewer to go to the next quote.
- Previous/Next buttons available in the bottom control bar.
- Like button:
  - Enabled for local quotes (numeric `id < 1000`)
  - Disabled for external quotes with a simple alert if attempted
- Share button: shows a mock toast notification.

### Public Types and API Client
- `src/api.ts` exports:
  - `fetchQuotes(page, limit)` → loads local quotes
  - `fetchReciteQuotes()` → loads and normalizes external quotes
  - `likeQuote(id)` → likes a local quote, returns new like count

---

## Running in Development

Two terminals recommended:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Navigate to `http://localhost:5173`. Ensure backend DB env is set and reachable.

---

## Building & Production

Backend:
```bash
cd backend
npm run build
npm start
```
This starts the compiled server from `dist/` on `PORT`.

Frontend:
```bash
cd frontend
npm run build
npm run preview  # local preview of built assets
```
For real deployment, serve `frontend/dist` via a static file host and deploy the backend separately. Set `VITE_API_BASE` at build time to point to the backend’s public URL.

---

## Troubleshooting
- Backend fails to start with DB errors
  - Check `.env` credentials; confirm `DB_PASSWORD` is provided and correct
  - Verify DB is running and `schema.sql`/`seed.sql` were applied
- CORS errors in browser
  - Ensure `FRONTEND_ORIGIN` in `backend/.env` matches the frontend origin (`http://localhost:5173` in dev)
- Likes not working
  - Only local quotes can be liked; external API quotes are read-only
  - Confirm the quote `id` is from local data (`< 1000`)
- No quotes shown
  - Confirm backend `/api/quotes` returns data
  - Check browser console/network tab for failing requests

---

## Notes & Limitations
- External Recite API is read-only and mapped into local `Quote` shape. IDs are offset to `>= 1000` to avoid conflicts.
- No authentication; likes are anonymous and not user-bound.
- Simple toast for share is a UI mock.

---

## Future Improvements
- Persist user sessions and per-user like state
- Add swipe gestures for mobile
- Add skeleton loading and error states per card
- Infinite scroll/pagination for large datasets
- Accessibility pass (focus states, keyboard controls, ARIA)
- Testing (unit/integration/e2e)
