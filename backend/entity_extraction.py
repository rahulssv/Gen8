import os
import json
import google.generativeai as genai
from dotenv import load_dotenv


def extract_entity_from_articles(articles, query):
    """
    Extract key entities from articles related to a specific query.
    
    Args:
        articles (list): List of article dictionaries
        query (str): The search query
        
    Returns:
        dict: JSON object containing key entities
    """
    # Prepare the prompt with article information
    prompt = f"""
    Extract key biomedical entities from these articles related to: {query}
    
    Focus on identifying important entities such as:
    - Genes
    - Proteins
    - Biomarkers
    - Diseases
    - Drugs/Treatments
    - Cell types
    - Biological processes
    
    For each entity, identify its type, mentions in the text, and any relations to other entities.
    
    Articles:
    """

    for article in articles:
        prompt += f"""
        {article['title']}\nAbstract: {article['abstract']}
        """

    prompt += """
    Format your response as a JSON array with the following structure:
    [
      {
        "name": "EGFR",
        "type": "gene",
        "mentions": 5,
        "relations": [
          {
            "subject": "EGFR",
            "predicate": "associated with",
            "object": "lung cancer",
            "confidence": 0.9
          }
        ]
      },
      {
        "name": "lung cancer",
        "type": "disease",
        "mentions": 8,
        "relations": [
          {
            "subject": "lung cancer",
            "predicate": "treated by",
            "object": "erlotinib",
            "confidence": 0.85
          }
        ]
      }
    ]
    
    Only include entities that are clearly relevant to the query. For each entity, include at least one relation if available.
    Return valid JSON only.
    """

    # Generate content using Gemini model
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)

    try:
        # Extract JSON from response
        response_text = response.text.strip()

        # Handle potential markdown code blocks in the response
        if response_text.startswith("```json"):
            response_text = response_text.strip("```json").strip()
        elif response_text.startswith("```"):
            response_text = response_text.strip("```").strip()

        # Parse the JSON
        entities = json.loads(response_text)
        return entities
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        print(f"Response text: {response.text}")
        return []
    except Exception as e:
        print(f"Unexpected error: {e}")
        return []

