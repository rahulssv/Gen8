import json
import google.generativeai as genai
from models import Drug

def extract_drugs_from_articles(articles, query):
    prompt = f"Extract atleast 4-5 relevant drugs for the query '{query}' from the following articles:\n\n"
    for article in articles:
        prompt += f"Title: {article['title']}\nAbstract: {article['abstract']}\n\n"
    
    prompt += "Format the response as a JSON list of drugs with the following fields: name, type, mechanism, efficacy, approvalStatus, url."
    
    print("[DEBUG] Generated prompt for Gemini model:")
    print(prompt)
    
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    
    print("[DEBUG] Response from Gemini model:")
    print(response.text)
    
    drugs = []
    try:
        # response.text.strip().strip("```json").strip("```")
        data = json.loads(response.text.strip().strip("```json").strip("```"))
        print("[DEBUG] Parsed data from Gemini response:")
        print(data)
        
        if isinstance(data, list):
            for drug in data:
                if all(key in drug for key in ['name', 'type', 'mechanism', 'efficacy', 'approvalStatus', 'url']):
                    drugs.append(Drug(
                        name=drug['name'],
                        type=drug['type'],
                        mechanism=drug['mechanism'],
                        efficacy=drug['efficacy'],
                        approval_status=drug['approvalStatus'],
                        url=drug['url']
                    ))
                else:
                    print(f"[DEBUG] Missing keys in drug data: {drug}")
        else:
            print("[DEBUG] Response is not a list")
        
        return drugs
    except Exception as e:
        print(f"Error extracting drugs: {str(e)}")
        return []