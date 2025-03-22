# import json
# import random
# from sqlalchemy.orm import Session
# from google.generativeai import GenerativeModel
# from models import Article,Biomarker # Import the Article and Biomarker models from models.py

# def extract_biomarkers_from_articles(articles, query):
#     prompt = f"Extract biomarkers related to {query} from the following articles:\n\n"
#     for article in articles:
#         prompt += f"Title: {article['title']}\nAbstract: {article['abstract']}\n\n"

#     print("[DEBUG] Generated prompt for biomarker extraction:")
#     print(prompt)

#     model = GenerativeModel('gemini-2.0-flash')
#     response = model.generate_content(
#     prompt 
#     + " Return only valid JSON. Format as a list of dictionaries: "
#     + "[{'id': str, 'name': str, 'value': str, 'unit': str, 'normal_range': {'min': float, 'max': float}, 'description': str}]."
#     + " Please include normal ranges strictly and set the min and max values correctly."
#     + " Please input 'value' as the int value from noraml range value it should be a normal value"
#     + " Example reference: "
#     + '{"id": "ldl", "name": "LDL Cholesterol", "value": 100, "unit": "mg/dL", "normal_range": {"min": 0, "max": 100}, "description": "Low-density lipoprotein, often called \'bad\' cholesterol."}'
#     + 'please dont put null in value field put any range between normal value'
    
# )

#     print("[DEBUG] Response from Generative AI model:")
#     # print(response.text)
#     # return response.text
#     try:
#         biomarkers_data = response.text.strip().strip("```json").strip("```")
#         return biomarkers_data

#     except json.JSONDecodeError as e:
#         print(f"[ERROR] Invalid JSON from model: {str(e)}")
#         print("[DEBUG] Response text was not valid JSON:")
#         print(response.text)
#         return []
#     except Exception as e:
#         print(f"[ERROR] Unexpected error: {str(e)}")
#         return []

# def get_articles_from_db(db: Session):
#     articles = db.query(Article).order_by(Article.relevance_score.desc()).all()
#     return [{
#         'id': str(article.pmid),
#         'title': article.title,
#         'authors': article.authors,
#         'journal': article.journal,
#         'year': article.year,
#         'url': article.url,
#         'abstract': article.abstract,
#         'source': article.source,
#         'relevanceScore': article.relevance_score
#     } for article in articles]


import json
import os
from sqlalchemy.orm import Session
from openai import OpenAI
from dotenv import load_dotenv
from models import Article, Biomarker  # Import the Article and Biomarker models from models.py

load_dotenv()

# Load environment variables
model = "llama-3-3-70b-instruct-AI_Team"
gateway_base_url = "https://zxz2wysnky.ap-south-1.awsapprunner.com"
gateway_api_key = "sk-ea75ec2759a548fabb97c4"

# Initialize OpenAI client
client = OpenAI(
    api_key=gateway_api_key,
    base_url=gateway_base_url,
)

# def extract_biomarkers_from_articles(articles, query):
#     prompt = f"Extract biomarkers related to {query} from the following articles:\n\n"
#     for article in articles:
#         prompt += f"Title: {article['title']}\nAbstract: {article['abstract']}\n\n"

#     print("[DEBUG] Generated prompt for biomarker extraction:")
#     print(prompt)

#     try:
#         response = client.chat.completions.create(
#             model=model,
#             messages=[{"role": "user", "content": prompt + " Return only valid JSON. Format as a list of dictionaries: "
#                        "[{'id': str, 'name': str, 'value': str, 'unit': str, 'normal_range': {'min': float, 'max': float}, 'description': str}]."
#                        " Please include normal ranges strictly and set the min and max values correctly."
#                        " Please input 'value' as an int within the normal range."
#                        " Example reference: "
#                        "{'id': 'ldl', 'name': 'LDL Cholesterol', 'value': 100, 'unit': 'mg/dL', 'normal_range': {'min': 0, 'max': 100}, 'description': 'Low-density lipoprotein, often called \'bad\' cholesterol.'}"}],
#             max_tokens=4096
#         )

#         if response and hasattr(response, "model_dump"):
#             response_data = response.model_dump()
#             if "choices" in response_data and len(response_data["choices"]) > 0:
#                 biomarkers_data = response_data["choices"][0]["message"]["content"].strip().strip("```json").strip("```")
#                 return json.loads(biomarkers_data)
    
#         print("[ERROR] Empty or unexpected response from OpenAI API")
#         return []
#     except json.JSONDecodeError as e:
#         print(f"[ERROR] Invalid JSON from model: {str(e)}")
#         return []
#     except Exception as e:
#         print(f"[ERROR] Unexpected error: {str(e)}")
#         return []

# def get_articles_from_db(db: Session):
#     articles = db.query(Article).order_by(Article.relevance_score.desc()).all()
#     return [{
#         'id': str(article.pmid),
#         'title': article.title,
#         'authors': article.authors,
#         'journal': article.journal,
#         'year': article.year,
#         'url': article.url,
#         'abstract': article.abstract,
#         'source': article.source,
#         'relevanceScore': article.relevance_score
#     } for article in articles]


import json
import os
from sqlalchemy.orm import Session
from openai import OpenAI
from dotenv import load_dotenv
from models import Article, Biomarker  # Import the Article and Biomarker models from models.py

load_dotenv()

# Load environment variables
model = os.getenv('MODEL')
gateway_base_url=os.getenv('GATEWAY_BASE_URL')
gateway_api_key=os.getenv('GATEWAY_API_KEY')

# gateway_base_url = "https://zxz2wysnky.ap-south-1.awsapprunner.com"
# gateway_api_key = "sk-ea75ec2759a548fabb97c4"

# Initialize OpenAI client
client = OpenAI(
    api_key=gateway_api_key,
    base_url=gateway_base_url,
)

def extract_biomarkers_from_articles(articles, query):
    prompt = f"Extract biomarkers related to {query} from the following articles:\n\n"
    for article in articles:
        prompt += f"Title: {article['title']}\nAbstract: {article['abstract']}\n\n"

    print("[DEBUG] Generated prompt for biomarker extraction:")
    print(prompt)

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt + " Return only valid JSON. Format as a list of dictionaries: "
                       "[{'id': str, 'name': str, 'value': str, 'unit': str, 'normal_range': {'min': float, 'max': float}, 'description': str}]."
                       " Please include normal ranges strictly and set the min and max values correctly."
                       " Please input 'value' as an int within the normal range."
                       " Example reference: "
                       "{'id': 'ldl', 'name': 'LDL Cholesterol', 'value': 100, 'unit': 'mg/dL', 'normal_range': {'min': 0, 'max': 100}, 'description': 'Low-density lipoprotein, often called \'bad\' cholesterol.'} take care of scenario if there is quotes inside string please take care it remains a valid json"}],
            max_tokens=4096
        )

        if response and hasattr(response, "model_dump"):
            response_data = response.model_dump()
            if "choices" in response_data and len(response_data["choices"]) > 0:
                biomarkers_data = response_data["choices"][0]["message"]["content"].strip().strip("```json").strip("```")
                try:
                    return json.loads(biomarkers_data)
                except json.JSONDecodeError as e:
                    print(f"[ERROR] Invalid JSON from model: {str(e)}")
                    print("[DEBUG] Response text was not valid JSON:")
                    print(biomarkers_data)
                    return []
    
        print("[ERROR] Empty or unexpected response from OpenAI API")
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