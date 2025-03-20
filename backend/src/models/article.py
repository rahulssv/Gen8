from datetime import datetime
from src.extensions.database import db

class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pmid = db.Column(db.String(20), unique=True)
    title = db.Column(db.String(500))
    authors = db.Column(db.ARRAY(db.String(200)))
    journal = db.Column(db.String(200))
    year = db.Column(db.Integer)
    url = db.Column(db.String(500))
    abstract = db.Column(db.Text)
    source = db.Column(db.String(50))
    relevance_score = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.pmid,
            "title": self.title,
            "authors": self.authors,
            "journal": self.journal,
            "year": self.year,
            "url": self.url,
            "abstract": self.abstract,
            "source": self.source,
            "relevance_score": self.relevance_score
        }