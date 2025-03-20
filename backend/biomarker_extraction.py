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
        prompt + "Return only valid JSON. Format as a list of dictionaries: "
        "[{'id': str, 'name': str, 'value': str, 'unit': str, 'normal_range': {'min': float, 'max': float}, 'description': str}]."
    )

    print("[DEBUG] Response from Generative AI model:")
    # print(response.text)
    # return response.text
    try:
        biomarkers_data = response.text.strip().strip("```json").strip("```")
        

    #     # Ensure normal_range and unit fields are present, add random range if missing
    #     biomarkers = []
    #     for biomarker_data in biomarkers_data:
    #         if 'normal_range' not in biomarker_data or not isinstance(biomarker_data['normal_range'], dict):
    #             biomarker_data['normal_range'] = {'min': round(random.uniform(0.1, 1.0), 2), 'max': round(random.uniform(1.1, 2.0), 2)}
    #         if 'unit' not in biomarker_data:
    #             biomarker_data['unit'] = "mg/dL"  # Default unit, change if needed

    #         biomarker = Biomarker(**biomarker_data)
    #         biomarkers.append(biomarker)

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