import os
import json
import google.generativeai as genai
 
def extract_key_findings_from_articles(articles, query):
    """
    Extract key statistical findings from articles related to a specific query,
    focusing on specific categories: survival at 15/10 months, efficacy, 
    significant findings, and hazard ratios.
    Args:
        articles (list): List of article dictionaries
        query (str): The search query
    Returns:
        dict: JSON object containing key statistical findings as one-liners
    """
    # Prepare the prompt with article information
    prompt = f"""
    Extract key statistical findings from these articles related to: {query}
    Focus specifically on the following categories and create one-liner summaries for each:
    1. Survival at 15 months (e.g., "15-month survival rate was 45% in the treatment group vs 30% in control (p=0.001)")
    2. Survival at 10 months (e.g., "10-month survival rate was 60% in the treatment group vs 45% in control (p=0.003)")
    3. Efficacy measures (e.g., "Treatment showed 40% reduction in tumor size (p<0.001) compared to standard care")
    4. Statistically significant findings (e.g., "Significant improvement in progression-free survival with combination therapy (p<0.0001)")
    5. Hazard ratio findings (e.g., "Hazard ratio for death was 0.65 (95% CI: 0.52-0.80) favoring the experimental treatment")
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
        "category": "survival_15_months",
        "finding": "15-month survival rate was 45% in the treatment group vs 30% in control (p=0.001)",
        "sourceArticleId": "12345678"
      },
      {
        "category": "survival_10_months",
        "finding": "10-month survival rate was 60% in the treatment group vs 45% in control (p=0.003)",
        "sourceArticleId": "12345678"
      },
      {
        "category": "efficacy",
        "finding": "Treatment showed 40% reduction in tumor size (p<0.001) compared to standard care",
        "sourceArticleId": "12345678"
      },
      {
        "category": "significant",
        "finding": "Significant improvement in progression-free survival with combination therapy (p<0.0001)",
        "sourceArticleId": "12345678"
      },
      {
        "category": "hazard_ratio",
        "finding": "Hazard ratio for death was 0.65 (95% CI: 0.52-0.80) favoring the experimental treatment",
        "sourceArticleId": "12345678"
      }
    ]
Only include findings with clear statistical significance. Make each finding concise but complete.
    If a specific category is not mentioned in the articles, don't include it in the results.
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
        findings = json.loads(response_text)
        return findings
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        print(f"Response text: {response.text}")
        return []
    except Exception as e:
        print(f"Unexpected error: {e}")
        return []