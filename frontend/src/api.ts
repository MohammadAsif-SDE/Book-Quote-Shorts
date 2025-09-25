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

export async function fetchQuotes(page = 1, limit = 20): Promise<Quote[]> {
  const res = await fetch(`${LOCAL_API_BASE}/quotes?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch quotes');
  const data = await res.json();
  return data.items as Quote[];
}

export async function fetchReciteQuotes(): Promise<Quote[]> {
  const res = await fetch(`${RECITE_API_BASE}/quotes`);
  if (!res.ok) throw new Error('Failed to fetch quotes from Recite API');
  const data = await res.json();
  
  // Transform Recite API response to our Quote format
  return data.quotes.map((quote: ReciteQuote, index: number) => ({
    id: index + 1000, // Use a different ID range to avoid conflicts
    text: quote.quote,
    author_name: quote.author,
    book_title: quote.book,
    likes: Math.floor(Math.random() * 50) + 1, // Random likes for demo
    created_at: quote.createdAt
  }));
}

export async function likeQuote(id: number): Promise<number> {
  // Only allow liking for local quotes (ID < 1000)
  if (id >= 1000) {
    throw new Error('Cannot like quotes from external API');
  }
  
  const res = await fetch(`${LOCAL_API_BASE}/quotes/${id}/like`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to like');
  const data = await res.json();
  return data.likes as number;
}


