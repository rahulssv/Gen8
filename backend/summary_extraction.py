import os
import json
import google.generativeai as genai
from typing import List, Dict, Any
from models import Summary

# # Configure Gemini API
# genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def extract_summary_from_articles(articles: List[Dict[str, Any]], query: str) -> Dict[str, Any]:
    """
    Extract a comprehensive summary from articles based on the query.
    
    Args:
        articles: List of article dictionaries containing title, abstract, etc.
        query: The user's search query
        
    Returns:
        A dictionary containing the summary information
    """
    # Prepare the prompt for the AI model
    prompt = f"""
    Generate a comprehensive summary about {query} based on the following scientific articles.
    Focus on key findings, consensus views, and important contradictions or gaps in knowledge.
    
    ARTICLES:
    """
    
    # Add each article's information to the prompt
    for article in articles:
        prompt += f"""
        {article['title']}\nAbstract: {article['abstract']}
        
        """
    
    prompt += """
    Please structure your summary with the following sections:
    1. Overview: A brief introduction to the topic
    2. Key Findings: The main discoveries or consensus from the literature
    3. Clinical Implications: How these findings might affect clinical practice
    4. Research Gaps: Areas where more research is needed
    5. Conclusion: A brief summary of the current state of knowledge
    
    Return your response as a valid JSON object with the following structure:
    {
        "overview": "text...",
        "keyFindings": "text...",
        "clinicalImplications": "text...",
        "researchGaps": "text...",
        "conclusion": "text..."
    }
    """
    
    try:
        # Generate content using Gemini AI
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        # Extract and parse the JSON from the response
        response_text = response.text
        
        # Clean up the response if it contains markdown code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        summary_data = json.loads(response_text)
        
        # Create a Summary object
        summary = Summary(
            overview=summary_data.get("overview", "No overview available"),
            key_findings=summary_data.get("keyFindings", "No key findings available"),
            clinical_implications=summary_data.get("clinicalImplications", "No clinical implications available"),
            research_gaps=summary_data.get("researchGaps", "No research gaps available"),
            conclusion=summary_data.get("conclusion", "No conclusion available")
        )
        
        return {
            "overview": summary.overview,
            "keyFindings": summary.key_findings,
            "clinicalImplications": summary.clinical_implications,
            "researchGaps": summary.research_gaps,
            "conclusion": summary.conclusion
        }
        
    except Exception as e:
        print(f"Error extracting summary: {str(e)}")
        return {
            "overview": "Error generating summary",
            "keyFindings": "Error generating key findings",
            "clinicalImplications": "Error generating clinical implications",
            "researchGaps": "Error generating research gaps",
            "conclusion": "Error generating conclusion"
        }

# def get_articles_from_db(db):
#     """
#     Get articles from the database.
    
#     Args:
#         db: Database session
        
#     Returns:
#         List of articles in dictionary format
#     """
#     from models import Article
    
#     articles = db.query(Article).all()
#     return [
#         {
#             'id': str(article.pmid),
#             'title': article.title,
#             'abstract': article.abstract,
#             'journal': article.journal,
#             'year': article.year,
#             'url': article.url
#         } 
#         for article in articles
#     ]
# import json
# import google.generativeai as genai

# def extract_summary_from_article():
#     prompt = f"Give summary on lung cancer disease"
#     print("[DEBUG] Generated prompt for Gemini model:")
#     print(prompt)
    
#     model = genai.GenerativeModel('gemini-2.0-flash')
#     response = model.generate_content(prompt)
    
#     print("[DEBUG] Response from Gemini model:")
#     print(response.text)
    
#     summary = response.text
#     try:
#         # # data = json.loads(response.text.strip().strip("```json").strip("```"))
#         # # print("[DEBUG] Parsed data from Gemini response:")
#         # print(data)
        
#         # if isinstance(data, list):
#         #     for disease in data:
#         #         if all(key in disease for key in ['disease', 'relationship', 'strength', 'evidence', 'notes']):
#         #             diseases.append(Disease(
#         #                 disease=disease['disease'],
#         #                 relationship=disease['relationship'],
#         #                 strength=disease['strength'],
#         #                 evidence=disease['evidence'],
#         #                 notes=disease.get('notes', '')
#         #             ))
#         #         else:
#         #             print(f"[DEBUG] Missing keys in disease data: {disease}")
#         # else:
#         #     print("[DEBUG] Response is not a list")
        
#         return summary
#     except Exception as e:
#         print(f"Error extracting diseases: {str(e)}")
#         return []