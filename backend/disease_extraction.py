import json
import google.generativeai as genai
from models import Disease

def extract_diseases_from_articles(articles, query):
    prompt = f"Extract at least 4-5 relevant diseases for the query '{query}' from the following articles:\n\n"
    for article in articles:
        prompt += f"Title: {article['title']}\nAbstract: {article['abstract']}\n\n"
    
    prompt += "Format the response as a JSON list of diseases with the following fields: disease, relationship, strength, evidence, notes."
    
    print("[DEBUG] Generated prompt for Gemini model:")
    print(prompt)
    
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    
    print("[DEBUG] Response from Gemini model:")
    print(response.text)
    
    diseases = []
    try:
        data = json.loads(response.text.strip().strip("```json").strip("```"))
        print("[DEBUG] Parsed data from Gemini response:")
        print(data)
        
        if isinstance(data, list):
            for disease in data:
                if all(key in disease for key in ['disease', 'relationship', 'strength', 'evidence', 'notes']):
                    diseases.append(Disease(
                        disease=disease['disease'],
                        relationship=disease['relationship'],
                        strength=disease['strength'],
                        evidence=disease['evidence'],
                        notes=disease.get('notes', '')
                    ))
                else:
                    print(f"[DEBUG] Missing keys in disease data: {disease}")
        else:
            print("[DEBUG] Response is not a list")
        
        return diseases
    except Exception as e:
        print(f"Error extracting diseases: {str(e)}")
        return []