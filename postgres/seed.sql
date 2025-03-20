INSERT INTO articles (pmid, title, journal, url, source)
VALUES ('123456', 'Sample Article', 'Example Journal', 'http://example.com', 'PubMed')
ON CONFLICT (pmid) DO NOTHING;