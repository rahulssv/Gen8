from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime
import os
from dotenv import load_dotenv
import requests
import re
import json
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Models
class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pmid = db.Column(db.String(20), unique=True)
    title = db.Column(db.String(500))
    authors = db.Column(ARRAY(db.String(200)))
    journal = db.Column(db.String(200))
    year = db.Column(db.Integer)
    url = db.Column(db.String(500))
    abstract = db.Column(db.Text)
    source = db.Column(db.String(50))
    relevance_score = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Entity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), index=True)
    type = db.Column(db.String(50), index=True)
    mentions = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Relation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('entity.id'))
    predicate = db.Column(db.String(200))
    object_id = db.Column(db.Integer, db.ForeignKey('entity.id'))
    confidence = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    subject = db.relationship('Entity', foreign_keys=[subject_id])
    object = db.relationship('Entity', foreign_keys=[object_id])

class StatisticalData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50))
    value = db.Column(db.String(100))
    unit = db.Column(db.String(50))
    context = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Initialize database
with app.app_context():
    db.create_all()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def save_to_database(articles, entities, relations, stats):
    """Save processed data to PostgreSQL database"""
    try:
        # Clear existing data
        db.session.query(Article).delete()
        db.session.query(Entity).delete()
        db.session.query(Relation).delete()
        db.session.query(StatisticalData).delete()
        
        # Add new data
        db.session.bulk_save_objects(articles)
        db.session.bulk_save_objects(entities)
        db.session.bulk_save_objects(relations)
        db.session.bulk_save_objects(stats)
        
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
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
            year=datetime.now().year,  # Temporary placeholder
            url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
            abstract=details.get("abstract", "No abstract available."),
            source="PubMed",
            relevance_score=0.9  # Temporary placeholder
        ))
    return best_articles

@app.route('/search', methods=['POST'])
def handle_search():
    query = request.json.get('query', '')
    
    # Fetch initial PMIDs
    pmids = fetch_pubmed_pmids(query, max_results=100)
    
    # Get basic details (title + journal)
    basic_details = fetch_pubmed_details(pmids)
    
    # First round of selection using titles
    selected_pmids = select_top_papers_with_gemini(basic_details, query)
    
    # Fetch abstracts for selected papers
    summaries = fetch_pubmed_summaries(selected_pmids)
    
    # Combine details with abstracts
    full_details = {
        pmid: {
            **basic_details.get(pmid, {}),
            "abstract": summaries.get(pmid, "No abstract available")
        }
        for pmid in selected_pmids
    }
    
    # Final selection with abstracts
    best_pmids = deep_search_with_gemini(full_details, query)
    
    # Generate article objects
    best_articles = generate_best_articles_json(best_pmids, full_details)
    
    # Process entities and relations using full details
    entities, relations = process_entities_and_relations(full_details)
    stats = process_statistics(full_details)
    
    if save_to_database(best_articles, entities, relations, stats):
        return jsonify({"status": "success", "message": "Data processed successfully"})
    else:
        return jsonify({"status": "error", "message": "Database save failed"}), 500
    
@app.route('/articles', methods=['GET'])
def get_articles():
    articles = Article.query.order_by(Article.relevance_score.desc()).all()
    return jsonify([{
        'id': str(article.pmid),
        'title': article.title,
        'authors': article.authors,
        'journal': article.journal,
        'year': article.year,
        'url': article.url,
        'abstract': article.abstract,
        'source': article.source,
        'relevanceScore': article.relevance_score
    } for article in articles])

@app.route('/entities', methods=['GET'])
def get_entities():
    entities = Entity.query.all()
    return jsonify([{
        'name': entity.name,
        'type': entity.type,
        'mentions': entity.mentions,
        'relations': [{
            'subject': rel.subject.name,
            'predicate': rel.predicate,
            'object': rel.object.name,
            'confidence': rel.confidence
        } for rel in entity.relations_as_subject]
    } for entity in entities])

@app.route('/statistics', methods=['GET'])
def get_statistics():
    stats = StatisticalData.query.all()
    return jsonify([{
        'type': stat.type,
        'value': stat.value,
        'unit': stat.unit,
        'context': stat.context
    } for stat in stats])

if __name__ == '__main__':
    app.run(port=5000, debug=True)