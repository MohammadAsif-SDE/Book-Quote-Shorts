import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quotesRouter from './routes/quotes';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Base route to indicate API is running
app.get('/', (_req, res) => {
  res.json({ message: 'Book Quotes API', docs: '/api' });
});

// API index route to avoid "Cannot GET /api"
app.get('/api', (_req, res) => {
  res.json({ message: 'API root', endpoints: ['/api/quotes', '/api/quotes/:id/like', '/health'] });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/quotes', quotesRouter);

// Fallback JSON 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});


