from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os
from dotenv import load_dotenv
import requests
import re
import json
import google.generativeai as genai
from biomarker_extraction import extract_biomarkers_from_articles, get_articles_from_db
from models import Base, Article, Entity, Relation, StatisticalData , Biomarker, Drug, ArticleDetails # Import models from models.py
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from drug_extraction import extract_drugs_from_articles
from disease_extraction import extract_diseases_from_articles
from co_biomarker_extraction import extract_co_biomarkers_from_articles
from process_pubmed_article import process_pubmed_article
from process_biomarkers import process_biomarkers
from summary_extraction import extract_summary_from_articles
from Key_findings_extraction import extract_key_findings_from_articles
from entity_extraction import extract_entity_from_articles

from typing import Optional, Dict , Any
from openai import OpenAI
from fastapi import FastAPI, HTTPException, status, Depends, UploadFile, File
import fitz

model = os.getenv('MODEL')
gateway_base_url=os.getenv('GATEWAY_BASE_URL')
gateway_api_key=os.getenv('GATEWAY_API_KEY')

client = OpenAI(
    api_key=gateway_api_key,
    base_url=gateway_base_url,
)


# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Database setup
SQLALCHEMY_DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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
        for article in articles:
            existing_article = db.query(Article).filter_by(pmid=article.pmid).first()
            if existing_article:
                db.merge(article)  # Update existing article
            else:
                db.add(article)  # Add new article

        for entity in entities:
            existing_entity = db.query(Entity).filter_by(name=entity.name).first()
            if existing_entity:
                db.merge(entity)  # Update existing entity
            else:
                db.add(entity)  # Add new entity

        for relation in relations:
            existing_relation = db.query(Relation).filter_by(subject_id=relation.subject_id, object_id=relation.object_id, predicate=relation.predicate).first()
            if existing_relation:
                db.merge(relation)  # Update existing relation
            else:
                db.add(relation)  # Add new relation

        for stat in stats:
            existing_stat = db.query(StatisticalData).filter_by(type=stat.type, value=stat.value, context=stat.context).first()
            if existing_stat:
                db.merge(stat)  # Update existing statistical data
            else:
                db.add(stat)  # Add new statistical data

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

def fetch_pubmed_pmids(query: str, max_results: int = 50) -> list:
    """
    Fetch PMIDs from PubMed based on the query. If the number of PMIDs found is less than 5,
    use an LLM to generate keywords, refine the query, and fetch additional PMIDs.

    Args:
        query (str): The search query.
        max_results (int): Maximum number of results to fetch.

    Returns:
        list: A list of PMIDs (as strings).
    """
    print("[DEBUG] Fetching PMIDs...")
    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": f"{query} AND hasabstract[text] AND (free full text[Filter] OR open access[Filter])",
        "retmode": "json",
        "retmax": max_results
    }
    pmid_list = []

    try:
        # Initial PubMed search
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        pmid_list = data.get("esearchresult", {}).get("idlist", [])
        print(f"[DEBUG] Total relevant PMIDs found: {len(pmid_list)}")

        # If PMIDs are less than 5, use LLM to generate keywords and refine the query
        if len(pmid_list) < 5:
            print("[DEBUG] Using LLM to generate keywords and refine search...")
            prompt = (
                f"From the following query, extract relevant biomarker keywords: {query}\n"
                "Return the keywords as a comma-separated list."
            )
            try:
                # Assuming `client` is already initialized and `model` is defined
                llm_response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=100
                )
                print(f"[DEBUG] LLM Response: {llm_response}")

                if llm_response and hasattr(llm_response, "choices"):
                    # Extract the content from the LLM response
                    llm_content = llm_response.choices[0].message.content.strip()
                    print(f"[DEBUG] Extracted Keywords: {llm_content}")

                    # Use the generated keywords as a new query
                    refined_query = llm_content
                    params["term"] = f"{refined_query} AND hasabstract[text] AND (free full text[Filter] OR open access[Filter])"

                    # Perform another PubMed search with the refined query
                    response = requests.get(base_url, params=params)
                    response.raise_for_status()
                    data = response.json()
                    additional_pmids = data.get("esearchresult", {}).get("idlist", [])
                    pmid_list.extend(additional_pmids)
                    print(f"[DEBUG] Total PMIDs found after refinement: {len(pmid_list)}")
                else:
                    print("[ERROR] LLM did not return valid keywords.")
            except Exception as e:
                print(f"[ERROR] LLM keyword generation failed: {e}")

        # Ensure pmid_list is always a list
        if not isinstance(pmid_list, list):
            print("[ERROR] PMID list is not in the expected format. Converting to an empty list.")
            pmid_list = []

        # Convert each number to a string
        pmid_list = [str(pmid) for pmid in pmid_list]
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

# def select_top_papers_with_gemini(details, query):
#     print("[DEBUG] Selecting top papers...")
#     prompt = f"Select the atleast 10 most relevant PubMed papers for: {query}\n\n"
#     for pmid, info in details.items():
#         prompt += f"PMID: {pmid}\nTitle: {info['title']}\nJournal: {info['journal']}\n\n"
    
#     model = genai.GenerativeModel('gemini-2.0-flash')
#     response = model.generate_content(prompt)
#     selected_pmids = re.findall(r'\d+', response.text)
#     return [pmid for pmid in selected_pmids if pmid in details][:5]

def select_top_papers_with_gemini(details, query):
    print("[DEBUG] Selecting top papers...")
    prompt = f"Select the at least 10 most relevant PubMed papers for: {query}\n\n"
    for pmid, info in details.items():
        prompt += f"PMID: {pmid}\nTitle: {info['title']}\nJournal: {info['journal']}\n\n"

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4096
        )

        if response and hasattr(response, "model_dump"):
            response_data = response.model_dump()
            if "choices" in response_data and len(response_data["choices"]) > 0:
                selected_pmids = re.findall(r'\d+', response_data["choices"][0]["message"]["content"])
                return [pmid for pmid in selected_pmids if pmid in details][:5]

        print("[ERROR] Empty or unexpected response from OpenAI API")
        return []
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        return []


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

# def deep_search_with_gemini(summaries, query):
#     print("[DEBUG] Performing deep search...")
#     prompt = f"Deep search: Select the most relevant PubMed papers for: {query}\n\n"
#     for pmid, summary in summaries.items():
#         prompt += f"PMID: {pmid}\nAbstract: {summary}\n\n"
    
#     model = genai.GenerativeModel('gemini-2.0-flash')
#     response = model.generate_content(prompt)
#     best_pmids = re.findall(r'\d+', response.text)
#     return [pmid for pmid in best_pmids if pmid in summaries][:5]


def deep_search_with_gemini(summaries, query):
    print("[DEBUG] Performing deep search...")
    prompt = f"Deep search: Select the most relevant PubMed papers for: {query}\n\n"
    for pmid, summary in summaries.items():
        prompt += f"PMID: {pmid}\nAbstract: {summary}\n\n"

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4096
        )

        if response and hasattr(response, "model_dump"):
            response_data = response.model_dump()
            if "choices" in response_data and len(response_data["choices"]) > 0:
                best_pmids = re.findall(r'\d+', response_data["choices"][0]["message"]["content"])
                return [pmid for pmid in best_pmids if pmid in summaries][:10]

        print("[ERROR] Empty or unexpected response from OpenAI API")
        return []
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        return []

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

def generate_biomarkers_json(biomarkers_data):
    print("[DEBUG] Saving biomarkers...")
    print("[DEBUG] Type of biomarkers_data:", type(biomarkers_data))
    
    # Convert the JSON string to a Python dictionary
    if isinstance(biomarkers_data, str):
        biomarkers_data = json.loads(biomarkers_data)
    
    print("[DEBUG] Type of biomarkers_data after conversion:", type(biomarkers_data))
    
    bm = []
    for biomarker in biomarkers_data:
        normal_range = biomarker.get('normal_range', {'min': 0.0, 'max': 0.0})
        bm.append(Biomarker(
            id=biomarker.get('id', '0'),
            name=biomarker.get('name', 'Unknown Biomarker'),
            value=biomarker.get('value', '0.0'),
            unit=biomarker.get('unit', 'Unknown Unit'),
            normal_range=normal_range,
            description=biomarker.get('description', 'No description available')
        ))
        # Process each biomarker as needed
    return bm

def generate_qna_from_articles(articles, query):
    prompt = f"Generate concise Q&A pairs based on the following query: {query}\n\n"
    for article in articles:
        prompt += f"Title: {article['title']}\nAbstract: {article['abstract']}\n\n"

    print("[DEBUG] Generated prompt for Q&A generation:")
    print(prompt)

    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(
        prompt + "Return only valid JSON. Format as a list of dictionaries: "
        "[{'question': str, 'answer': str}]."
    )

    print("[DEBUG] Response from Generative AI model:")
    try:
        qna_data = response.text.strip().strip("```json").strip("```")
        return json.loads(qna_data)
    except json.JSONDecodeError as e:
        print(f"[ERROR] Invalid JSON from model: {str(e)}")
        print("[DEBUG] Response text was not valid JSON:")
        print(response.text)
        return []
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        return []

@app.post("/search")
def handle_search(search_query: SearchQuery, db: Session = Depends(get_db)):
    query = search_query.query
    
    pmids = fetch_pubmed_pmids(query, max_results=50)
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


@app.get("/biomarkers")
def get_biomarkers(query: str, db: Session = Depends(get_db)):
    articles = get_articles_from_db(db)
    biomarkers = extract_biomarkers_from_articles(articles, query)
    print("[DEBUG] Biomarkers to be returned:")
    biomarkers_json = generate_biomarkers_json(biomarkers)
    print(biomarkers)
    return biomarkers_json

@app.get("/drugs")
def get_drugs(query: str, db: Session = Depends(get_db)):
    articles = get_articles_from_db(db)
    drugs = extract_drugs_from_articles(articles, query)
    return [{
        'name': drug.name,
        'type': drug.type,
        'mechanism': drug.mechanism,
        'efficacy': drug.efficacy,
        'approvalStatus': drug.approval_status,
        'url': drug.url
    } for drug in drugs]

@app.get("/getqna")
def get_qna(query: str, db: Session = Depends(get_db)):
    # Fetch articles from the database
    articles = get_articles_from_db(db)

    # Generate Q&A pairs using the helper function
    qna_list = generate_qna_from_articles(articles, query)

    # Return the generated Q&A pairs
    return qna_list


@app.get("/disease")
def get_diseases(query: str, db: Session = Depends(get_db)):
    articles = get_articles_from_db(db)
    diseases = extract_diseases_from_articles(articles, query)
    return [{
        'disease': disease.disease,
        'relationship': disease.relationship,
        'strength': disease.strength,
        'evidence': disease.evidence,
        'notes': disease.notes
    } for disease in diseases]


@app.get("/co-biomarkers")
def get_co_biomarkers(query: str, db: Session = Depends(get_db)):
    articles = get_articles_from_db(db)
    if not articles:
        raise HTTPException(status_code=404, detail="No articles found")
    
    # print(articles)
    co_biomarkers = extract_co_biomarkers_from_articles(articles, query)
    return co_biomarkers

@app.get("/process-article")
def process_article(url: str):
    """
    API endpoint to process a PubMed article and return details.
    """
    article_details = process_pubmed_article(url)
    return article_details.dict()
    

class NormalRange(BaseModel):
    min: float
    max: float

class BiomarkerInput(BaseModel):
    name: str
    value: int
    unit: str
    normal_range: NormalRange

class BiomarkerAnalysisResponse(BaseModel):
    summary: str
    risk_level: str
    abnormal_markers: List[Dict[str, Any]]
    potential_conditions: List[Dict[str, Any]]
    lifestyle_recommendations: List[str]

@app.post("/biomarkers", response_model=BiomarkerAnalysisResponse)
def analyze_biomarkers(biomarkers: List[BiomarkerInput]):
    try:
        biomarkers_dict = [biomarker.dict() for biomarker in biomarkers]
        analysis_result = process_biomarkers(biomarkers_dict)
        if not analysis_result:
            raise HTTPException(status_code=500, detail="Failed to process biomarkers")
        return analysis_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/summary")
def get_summary(query: str, db: Session = Depends(get_db)):
    articles = get_articles_from_db(db)
    summary = extract_summary_from_articles(articles, query)
    return summary
 
@app.get("/key_findings")
def get_key_findings(query: str, db: Session = Depends(get_db)):
    """
    Get key statistical findings from articles related to a query.
   
    Args:
        query (str): The search query
        db (Session): Database session
       
    Returns:
        list: List of key statistical findings
    """
    articles = get_articles_from_db(db)
    if not articles:
        raise HTTPException(status_code=404, detail="No articles found")
   
    key_findings = extract_key_findings_from_articles(articles, query)
    return key_findings

@app.get("/key_entities")
def get_key_entities(query: str, db: Session = Depends(get_db)):
    """
    Get key entities from articles related to a query.
   
    Args:
        query (str): The search query
        db (Session): Database session
       
    Returns:
        list: List of key entities
    """
    articles = get_articles_from_db(db)
    if not articles:
        raise HTTPException(status_code=404, detail="No articles found")
   
    try:
        key_entities = extract_entity_from_articles(articles, query)
        return key_entities
    except Exception as e:
        print(f"Error extracting key entities: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error extracting key entities: {str(e)}")
def extract_text_from_pdf(pdf_file: UploadFile) -> str:
    """Extracts text from an uploaded PDF file."""
    doc = fitz.open(stream=pdf_file.file.read(), filetype="pdf")
    text = "\n".join([page.get_text("text") for page in doc])
    return text


def generate_summary(text: str) -> Dict:
    """Processes the extracted text with the LLM to generate a structured summary."""
    prompt = (
        "Analyze the given article and provide a well-structured summary including key findings. "
        "Return only valid JSON in the following format:\n"
        '{\"summary\": \"string\", \"key_findings\": [{\"point\": \"string\"}]}'
        "\n\n"
        f"Article Text:\n{text}"
    )
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4096
        )

        if response and hasattr(response, "model_dump"):
            response_data = response.model_dump()
            if "choices" in response_data and len(response_data["choices"]) > 0:
                analysis_data = response_data["choices"][0]["message"]["content"].strip().strip("```json").strip("```")
                
                try:
                    parsed_data = json.loads(analysis_data)
                    return parsed_data
                except json.JSONDecodeError as e:
                    print(f"[ERROR] Invalid JSON from model: {str(e)}")
                    return {"error": "Invalid response format"}
    
        return {"error": "Unexpected LLM response"}
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        return {"error": "Internal server error"}


@app.post("/article")
async def process_article(pdf: UploadFile = File(...)):
    """Handles the /article endpoint, processing the uploaded PDF and returning a structured summary."""
    try:
        text = extract_text_from_pdf(pdf)
        if not text:
            return {"error": "No text extracted from the PDF"}
        summary = generate_summary(text)
        return summary
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return {"error": "Failed to process the PDF"}
 

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, port=8000, debug=True)