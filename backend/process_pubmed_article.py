import requests
import json
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from models import ArticleDetails


def process_pubmed_article(url: str) -> ArticleDetails:
    """
    Process a PubMed article by extracting details and generating AI-based insights.
    """
    # Extract PMID from the URL
    try:
        pmid = url.split("/")[-2]
    except IndexError:
        return ArticleDetails(
            pmid="N/A",
            title="N/A",
            abstract=None,
            keywords=None,
            summary=None,
            qna_pairs=None,
            message="Invalid PubMed URL"
        )

    # Fetch article details from PubMed
    abstract_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    params = {"db": "pubmed", "id": pmid, "retmode": "text", "rettype": "abstract"}
    try:
        response = requests.get(abstract_url, params=params)
        response.raise_for_status()
        article_text = response.text.strip()
    except Exception as e:
        return ArticleDetails(
            pmid=pmid,
            title="N/A",
            abstract=None,
            keywords=None,
            summary=None,
            qna_pairs=None,
            message=f"Error fetching article: {str(e)}"
        )

    # Extract title and abstract
    title = "Title not available"
    abstract = "Abstract not available"
    if article_text:
        lines = article_text.split("\n")
        title = lines[0] if lines else title
        abstract = "\n".join(lines[1:]) if len(lines) > 1 else abstract

    # Generate AI-based insights using Gemini
    try:
        # Generate summary
        summary_prompt = f"Summarize the following article:\n\nTitle: {title}\nAbstract: {abstract}\n\n"
        model = genai.GenerativeModel('gemini-2.0-flash')
        summary_response = model.generate_content(summary_prompt)
        summary = summary_response.text.strip()

        # Generate keywords
        keywords_prompt = f"Extract keywords from the following article:\n\nTitle: {title}\nAbstract: {abstract}\n\n"
        keywords_response = model.generate_content(keywords_prompt)
        raw_keywords = keywords_response.text.strip()

        # Convert keywords into a JSON-friendly format
        keywords = []
        for line in raw_keywords.split("\n"):
            if line.startswith("*"):  # Extract lines starting with '*'
                keywords.append(line.strip("* ").strip())

        # Generate Q&A pairs
        qna_prompt = f"Generate concise Q&A pairs based on the following article:\n\nTitle: {title}\nAbstract: {abstract}\n\n"
        qna_response = model.generate_content(
            qna_prompt + "Return only valid JSON. Format as a list of dictionaries: [{'question': str, 'answer': str}]."
        )
        qna_pairs = json.loads(qna_response.text.strip().strip("```json").strip("```"))

    except Exception as e:
        return ArticleDetails(
            pmid=pmid,
            title=title,
            abstract=abstract,
            keywords=None,
            summary=None,
            qna_pairs=None,
            message=f"Error processing article with AI: {str(e)}"
        )

    # Return the processed details
    return ArticleDetails(
        pmid=pmid,
        title=title,
        abstract=abstract,
        keywords=keywords,
        summary=summary,
        qna_pairs=qna_pairs,
        message="Processing successful"
    )