CREATE TABLE IF NOT EXISTS llink.urls (
  shortcode TEXT PRIMARY KEY,
  original_url TEXT,
  created_at TIMESTAMP
);