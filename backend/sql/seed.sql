-- Seed sample data
INSERT INTO authors (name) VALUES
  ('Haruki Murakami'),
  ('Jane Austen'),
  ('George Orwell')
ON CONFLICT DO NOTHING;

INSERT INTO books (title, author_id)
SELECT * FROM (VALUES
  ('Kafka on the Shore', (SELECT id FROM authors WHERE name = 'Haruki Murakami')),
  ('Norwegian Wood', (SELECT id FROM authors WHERE name = 'Haruki Murakami')),
  ('Pride and Prejudice', (SELECT id FROM authors WHERE name = 'Jane Austen')),
  ('1984', (SELECT id FROM authors WHERE name = 'George Orwell'))
) AS v(title, author_id)
ON CONFLICT DO NOTHING;

INSERT INTO quotes (author_id, book_id, text, likes)
SELECT * FROM (VALUES
  ((SELECT id FROM authors WHERE name = 'Haruki Murakami'), (SELECT id FROM books WHERE title = 'Kafka on the Shore'), 'Memories warm you up from the inside. But they also tear you apart.', 15),
  ((SELECT id FROM authors WHERE name = 'Haruki Murakami'), (SELECT id FROM books WHERE title = 'Norwegian Wood'), 'If you only read the books that everyone else is reading, you can only think what everyone else is thinking.', 8),
  ((SELECT id FROM authors WHERE name = 'Jane Austen'), (SELECT id FROM books WHERE title = 'Pride and Prejudice'), 'I declare after all there is no enjoyment like reading!', 23),
  ((SELECT id FROM authors WHERE name = 'George Orwell'), (SELECT id FROM books WHERE title = '1984'), 'Perhaps one did not want to be loved so much as to be understood.', 12)
) AS v(author_id, book_id, text, likes);

