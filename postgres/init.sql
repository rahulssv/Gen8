CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    pmid VARCHAR(20) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    authors TEXT[],
    journal VARCHAR(200),
    year INT,
    url TEXT NOT NULL,
    abstract TEXT,
    source VARCHAR(50) NOT NULL,
    relevance_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add other table creation scripts as needed