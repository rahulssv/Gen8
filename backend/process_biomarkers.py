import json
from openai import OpenAI
from dotenv import load_dotenv
import os
from typing import List

load_dotenv()

# Load environment variables
model = os.getenv('MODEL')
gateway_base_url = os.getenv('GATEWAY_BASE_URL')
gateway_api_key = os.getenv('GATEWAY_API_KEY')

# Initialize OpenAI client
client = OpenAI(
    api_key=gateway_api_key,
    base_url=gateway_base_url,
)

def process_biomarkers(biomarkers: List[dict]):
    prompt = (
        "Analyze the following biomarkers and provide a summary, risk level, abnormal markers, potential conditions, "
        "and lifestyle recommendations. Return only valid JSON in the following format:\n"
        '{"summary": "string", "risk_level": "low" | "moderate" | "high" | "very_high", '
        '"abnormal_markers": [{"id": "string", "name": "string", "value": "int", "unit": "string", "deviation": "above" | "below", '
        '"deviation_percentage": "float"}], "potential_conditions": [{"name": "string", "probability": "float", "description": "string", '
        '"recommendations": ["string"]}], "lifestyle_recommendations": ["string"]}\n\n'
        'p.s if there is string inside the string and using quotes please take care that it remains a valid json'

        f"{json.dumps(biomarkers)}"
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
                print("[DEBUG] Raw response data:", analysis_data)
                try:
                    # Replace single quotes with double quotes
                    analysis_data = analysis_data.replace("'", '"')
                    parsed_data = json.loads(analysis_data)
                    print("[DEBUG] Parsed JSON data:", parsed_data)
                    return parsed_data
                except json.JSONDecodeError as e:
                    print(f"[ERROR] Invalid JSON from model: {str(e)}")
                    print("[DEBUG] Response text was not valid JSON:")
                    print(analysis_data)
                    return {}
    
        print("[ERROR] Empty or unexpected response from OpenAI API")
        return {}
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        return {}