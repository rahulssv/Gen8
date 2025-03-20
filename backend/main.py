from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import os
from dotenv import load_dotenv
import requests
import re
import json
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Database setup
SQLALCHEMY_DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class Article(Base):
    __tablename__ = 'article'
    id = Column(Integer, primary_key=True)
    pmid = Column(String(20), unique=True)
    title = Column(String(500))
    authors = Column(ARRAY(String(200)))
    journal = Column(String(200))
    year = Column(Integer)
    url = Column(String(500))
    abstract = Column(Text)
    source = Column(String(50))
    relevance_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class Entity(Base):
    __tablename__ = 'entity'
    id = Column(Integer, primary_key=True)
    name = Column(String(200), index=True)
    type = Column(String(50), index=True)
    mentions = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

class Relation(Base):
    __tablename__ = 'relation'
    id = Column(Integer, primary_key=True)
    subject_id = Column(Integer, ForeignKey('entity.id'))
    predicate = Column(String(200))
    object_id = Column(Integer, ForeignKey('entity.id'))
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    subject = relationship('Entity', foreign_keys=[subject_id], backref='relations_as_subject')
    object = relationship('Entity', foreign_keys=[object_id], backref='relations_as_object')

class StatisticalData(Base):
    __tablename__ = 'statistical_data'
    id = Column(Integer, primary_key=True)
    type = Column(String(50))
    value = Column(String(100))
    unit = Column(String(50))
    context = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app setup
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class SearchQuery(BaseModel):
    query: str

def save_to_database(db: Session, articles, entities, relations, stats):
    """Save processed data to PostgreSQL database"""
    try:
        # Clear existing data
        db.query(Article).delete()
        db.query(Entity).delete()
        db.query(Relation).delete()
        db.query(StatisticalData).delete()
        
        # Add new data
        db.bulk_save_objects(articles)
        db.bulk_save_objects(entities)
        db.bulk_save_objects(relations)
        db.bulk_save_objects(stats)
        
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(f"Database error: {str(e)}")
        return False

def process_entities_and_relations(paper_data):
    """Process entities and relations using Gemini"""
    prompt = "Extract biomedical entities and relations from these papers:\n\n"
    for pmid, details in paper_data.items():
        prompt += f"Title: {details['title']}\nAbstract: {details['abstract']}\n\n"
    
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt + "Format as JSON with entities and relations lists.")
    
    entities = []
    relations = []
    entity_map = {}
    
    try:
        data = json.loads(response.text)
        # Process entities
        for idx, entity in enumerate(data.get('entities', [])):
            entity_record = Entity(
                name=entity['name'],
                type=entity['type'],
                mentions=entity.get('mentions', 1)
            )
            entities.append(entity_record)
            entity_map[entity['name']] = entity_record
        
        # Process relations
        for rel in data.get('relations', []):
            subject = entity_map.get(rel['subject'])
            obj = entity_map.get(rel['object'])
            
            if subject and obj:
                relation_record = Relation(
                    subject_id=subject.id,
                    predicate=rel['predicate'],
                    object_id=obj.id,
                    confidence=rel.get('confidence', 0.0)
                )
                relations.append(relation_record)
                
        return entities, relations
    except Exception as e:
        print(f"Error processing entities/relations: {str(e)}")
        return [], []

def process_statistics(paper_data):
    """Process statistical data using Gemini"""
    prompt = "Extract statistical findings from these papers:\n\n"
    for pmid, details in paper_data.items():
        prompt += f"{details['abstract']}\n"
    
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt + "Format as JSON list of statistical data.")
    
    stats = []
    try:
        data = json.loads(response.text)
        for stat in data:
            stats.append(StatisticalData(
                type=stat['type'],
                value=str(stat['value']),
                unit=stat.get('unit'),
                context=stat['context']
            ))
        return stats
    except Exception as e:
        print(f"Error processing statistics: {str(e)}")
        return []

def fetch_pubmed_pmids(query, max_results=100):
    print("[DEBUG] Fetching PMIDs...")
    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": f"{query} AND hasabstract[text] AND (free full text[Filter] OR open access[Filter])",
        "retmode": "json",
        "retmax": max_results
    }
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        pmid_list = data.get("esearchresult", {}).get("idlist", [])
        print(f"[DEBUG] Total relevant PMIDs found: {len(pmid_list)}")
        return pmid_list
    except Exception as e:
        print(f"[ERROR] Fetching PMIDs: {e}")
        return []

def fetch_pubmed_details(pmids):
    print("[DEBUG] Fetching titles and journal names...")
    details = {}
    summary_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
    params = {"db": "pubmed", "id": ",".join(pmids), "retmode": "json"}
    try:
        response = requests.get(summary_url, params=params)
        response.raise_for_status()
        summary_data = response.json().get("result", {})
        for pmid in pmids:
            item = summary_data.get(pmid, {})
            pub_date = item.get("pubdate", "")
            details[pmid] = {
                "title": item.get("title", "Title not available"),
                "journal": item.get("source", "Unknown Journal"),
                "year": int(pub_date[:4]) if pub_date else None
            }
    except Exception as e:
        print(f"[ERROR] Fetching details: {e}")
    return details

def select_top_papers_with_gemini(details, query):
    print("[DEBUG] Selecting top papers...")
    prompt = f"Select the most relevant PubMed papers for: {query}\n\n"
    for pmid, info in details.items():
        prompt += f"PMID: {pmid}\nTitle: {info['title']}\nJournal: {info['journal']}\n\n"
    
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    selected_pmids = re.findall(r'\d+', response.text)
    return [pmid for pmid in selected_pmids if pmid in details][:5]

def fetch_pubmed_summaries(pmids):
    print("[DEBUG] Fetching summaries...")
    summaries = {}
    abstract_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    
    for pmid in pmids:
        params = {"db": "pubmed", "id": pmid, "retmode": "text", "rettype": "abstract"}
        try:
            response = requests.get(abstract_url, params=params)
            response.raise_for_status()
            summaries[pmid] = response.text.strip()
        except Exception as e:
            print(f"[ERROR] Fetching abstract for PMID {pmid}: {e}")
    
    return summaries

def deep_search_with_gemini(summaries, query):
    print("[DEBUG] Performing deep search...")
    prompt = f"Deep search: Select the most relevant PubMed papers for: {query}\n\n"
    for pmid, summary in summaries.items():
        prompt += f"PMID: {pmid}\nAbstract: {summary}\n\n"
    
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    best_pmids = re.findall(r'\d+', response.text)
    return [pmid for pmid in best_pmids if pmid in summaries][:5]

def generate_best_articles_json(best_pmids, full_details):
    print("[DEBUG] Saving best articles...")
    best_articles = []
    for pmid in best_pmids:
        details = full_details.get(pmid, {})
        best_articles.append(Article(
            pmid=pmid,
            title=details.get("title", "Title not available"),
            authors=[],
            journal=details.get("journal", "Unknown Journal"),
            year=datetime.now().year,
            url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
            abstract=details.get("abstract", "No abstract available."),
            source="PubMed",
            relevance_score=0.9
        ))
    return best_articles

@app.post("/search")
def handle_search(search_query: SearchQuery, db: Session = Depends(get_db)):
    query = search_query.query
    
    pmids = fetch_pubmed_pmids(query, max_results=100)
    basic_details = fetch_pubmed_details(pmids)
    selected_pmids = select_top_papers_with_gemini(basic_details, query)
    summaries = fetch_pubmed_summaries(selected_pmids)
    
    full_details = {
        pmid: {
            **basic_details.get(pmid, {}),
            "abstract": summaries.get(pmid, "No abstract available")
        }
        for pmid in selected_pmids
    }
    
    best_pmids = deep_search_with_gemini(full_details, query)
    best_articles = generate_best_articles_json(best_pmids, full_details)
    entities, relations = process_entities_and_relations(full_details)
    stats = process_statistics(full_details)
    
    if save_to_database(db, best_articles, entities, relations, stats):
        return {"status": "success", "message": "Data processed successfully"}
    else:
        raise HTTPException(status_code=500, detail="Database save failed")

@app.get("/articles")
def get_articles(db: Session = Depends(get_db)):
    articles = db.query(Article).order_by(Article.relevance_score.desc()).all()
    return [{
        'id': str(article.pmid),
        'title': article.title,
        'authors': article.authors,
        'journal': article.journal,
        'year': article.year,
        'url': article.url,
        'abstract': article.abstract,
        'source': article.source,
        'relevanceScore': article.relevance_score
    } for article in articles]

@app.get("/entities")
def get_entities(db: Session = Depends(get_db)):
    entities = db.query(Entity).all()
    results = []
    for entity in entities:
        relations = []
        for rel in entity.relations_as_subject:
            relations.append({
                'subject': rel.subject.name,
                'predicate': rel.predicate,
                'object': rel.object.name,
                'confidence': rel.confidence
            })
        results.append({
            'name': entity.name,
            'type': entity.type,
            'mentions': entity.mentions,
            'relations': relations
        })
    return results

@app.get("/statistics")
def get_statistics(db: Session = Depends(get_db)):
    stats = db.query(StatisticalData).all()
    return [{
        'type': stat.type,
        'value': stat.value,
        'unit': stat.unit,
        'context': stat.context
    } for stat in stats]

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, port=8000, debug=True)