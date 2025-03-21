import json
from sqlalchemy.orm import Session
import google.generativeai as genai
from models import Article  # Import the Article model from models.py
from fastapi import APIRouter, Depends, HTTPException



def extract_co_biomarkers_from_articles(articles, query):
    prompt = f"Extract co-biomarkers and mutations related to {query} from the following articles:\n\n"
    for article in articles:
        prompt += f"Title: {article['title']}\nAbstract: {article['abstract']}\n\n"
    
    prompt += "Return only valid JSON. Format as a list of dictionaries: [{'name': str, 'type': str, 'effect': str, 'clinicalImplication': str, 'frequencyOfCooccurrence': str}]."
    
    print("[DEBUG] Generated prompt for co-biomarker extraction:")
    print(prompt)
    
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    
    print("[DEBUG] Response from Generative AI model for co mutations & biomarkers:")
    print(response.text)
    co_biomarkers = []
    try:
        data = json.loads(response.text.strip().strip("```json").strip("```"))
        print("[DEBUG] Parsed data from Generative AI response:")
        print(data)
        
        if isinstance(data, list):
            for biomarker in data:
                if all(key in biomarker for key in ['name', 'type', 'effect', 'clinicalImplication', 'frequencyOfCooccurrence']):
                    co_biomarkers.append({
                        'name': biomarker['name'],
                        'type': biomarker['type'],
                        'effect': biomarker['effect'],
                        'clinicalImplication': biomarker['clinicalImplication'],
                        'frequencyOfCooccurrence': biomarker['frequencyOfCooccurrence']
                    })
                else:
                    print(f"[DEBUG] Missing keys in biomarker data: {biomarker}")
        else:
            print("[DEBUG] Response is not a list")
        
        return co_biomarkers
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        return []

def get_articles_from_db(db: Session):
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

