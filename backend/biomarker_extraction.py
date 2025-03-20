import json
import random
from sqlalchemy.orm import Session
from google.generativeai import GenerativeModel
from models import Article,Biomarker # Import the Article and Biomarker models from models.py

def extract_biomarkers_from_articles(articles, query):
    prompt = f"Extract biomarkers related to {query} from the following articles:\n\n"
    for article in articles:
        prompt += f"Title: {article['title']}\nAbstract: {article['abstract']}\n\n"

    print("[DEBUG] Generated prompt for biomarker extraction:")
    print(prompt)

    model = GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(
        prompt + "Return only valid JSON. Format as a list of dictionaries: Please include normal ranges stricly and its min and max value correctly"
        "[{'id': str, 'name': str, 'value': str, 'unit': str, 'normal_range': {'min': float, 'max': float}, 'description': str}]."
    )

    print("[DEBUG] Response from Generative AI model:")
    # print(response.text)
    # return response.text
    try:
        biomarkers_data = response.text.strip().strip("```json").strip("```")
        return biomarkers_data

    except json.JSONDecodeError as e:
        print(f"[ERROR] Invalid JSON from model: {str(e)}")
        print("[DEBUG] Response text was not valid JSON:")
        print(response.text)
        return []
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