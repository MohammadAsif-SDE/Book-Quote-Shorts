export type Quote = {
  id: number;
  text: string;
  author_name: string;
  book_title: string;
  likes: number;
  created_at: string;
};

export type ReciteQuote = {
  _id: string;
  quote: string;
  book: string;
  author: string;
  length: number;
  words: number;
  createdAt: string;
  updatedAt: string;
};

const LOCAL_API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
const RECITE_API_BASE = 'https://recite.onrender.com/api/v1';

// Fallback quotes used when backend API is unavailable or returns no items
export const FALLBACK_QUOTES: Quote[] = [
  {
    id: 1,
    text: 'It is our choices, Harry, that show what we truly are, far more than our abilities.',
    author_name: 'J.K. Rowling',
    book_title: 'Harry Potter and the Chamber of Secrets',
    likes: 12,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    text: 'Not all those who wander are lost.',
    author_name: 'J.R.R. Tolkien',
    book_title: 'The Lord of the Rings',
    likes: 18,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    text: 'The only limit to our realization of tomorrow is our doubts of today.',
    author_name: 'Franklin D. Roosevelt',
    book_title: 'Looking Forward',
    likes: 9,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    text: 'So we beat on, boats against the current, borne back ceaselessly into the past.',
    author_name: 'F. Scott Fitzgerald',
    book_title: 'The Great Gatsby',
    likes: 7,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    text: 'Whatever our souls are made of, his and mine are the same.',
    author_name: 'Emily Brontë',
    book_title: 'Wuthering Heights',
    likes: 5,
    created_at: new Date().toISOString(),
  },
];

// Local storage helpers for likes
const LIKES_KEY = 'book_quotes_likes';

function readLikesMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    return raw ? JSON.parse(raw) as Record<string, number> : {};
  } catch {
    return {};
  }
}

function writeLikesMap(map: Record<string, number>) {
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

export function getStoredLikes(id: number): number | undefined {
  const map = readLikesMap();
  const key = String(id);
  return typeof map[key] === 'number' ? map[key] : undefined;
}

export function setStoredLikes(id: number, likes: number): number {
  const map = readLikesMap();
  map[String(id)] = likes;
  writeLikesMap(map);
  return likes;
}

export function incrementLike(id: number, fallbackStart = 0): number {
  const current = getStoredLikes(id);
  const next = (typeof current === 'number' ? current : fallbackStart) + 1;
  return setStoredLikes(id, next);
}

export async function fetchQuotes(page = 1, limit = 20): Promise<Quote[]> {
  try {
    const res = await fetch(`${LOCAL_API_BASE}/quotes?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch quotes');
    const data = await res.json();
    const items = (data.items as Quote[]) || [];
    const finalItems = items.length > 0 ? items : FALLBACK_QUOTES;
    // Apply stored likes if present
    return finalItems.map(q => ({
      ...q,
      likes: getStoredLikes(q.id) ?? q.likes ?? 0,
    }));
  } catch {
    // On failure, use fallback quotes
    return FALLBACK_QUOTES.map(q => ({
      ...q,
      likes: getStoredLikes(q.id) ?? q.likes ?? 0,
    }));
  }
}

export async function fetchReciteQuotes(): Promise<Quote[]> {
  const res = await fetch(`${RECITE_API_BASE}/quotes`);
  if (!res.ok) throw new Error('Failed to fetch quotes from Recite API');
  const data = await res.json();
  
  // Transform Recite API response to our Quote format
  return data.quotes.map((quote: ReciteQuote, index: number) => {
    const id = index + 1000; // Use a different ID range to avoid conflicts
    const defaultLikes = Math.floor(Math.random() * 50) + 1;
    return {
      id,
      text: quote.quote,
      author_name: quote.author,
      book_title: quote.book,
      likes: getStoredLikes(id) ?? defaultLikes,
      created_at: quote.createdAt
    } as Quote;
  });
}

export async function likeQuote(id: number): Promise<number> {
  // Store likes in localStorage for all quotes
  const current = getStoredLikes(id);
  const start = typeof current === 'number' ? current : 0;
  return incrementLike(id, start);
}


