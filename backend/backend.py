import requests
import google.generativeai as genai
import json
import re
from xml.etree import ElementTree as ET

# Configure Gemini API Key
genai.configure(api_key="put ur api key here")

# Function to search PubMed and retrieve PMIDs
def search_pubmed(query, max_results=100):
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": query,
        "retmode": "json",
        "retmax": max_results,
        "sort": "relevance"
    }
    response = requests.get(url, params=params)
    data = response.json()
    return data.get("esearchresult", {}).get("idlist", [])

# Function to fetch abstracts for given PMIDs
def fetch_abstracts(pmids):
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml"
    }
    response = requests.get(url, params=params)
    abstracts = {}

    if response.status_code == 200:
        root = ET.fromstring(response.text)
        
        for article in root.findall(".//PubmedArticle"):
            # Extract PMID
            pmid_elem = article.find(".//PMID")
            pmid = pmid_elem.text if pmid_elem is not None else "N/A"
            
            # Extract title
            title_elem = article.find(".//ArticleTitle")
            title = title_elem.text if title_elem is not None else "Title not available"
            
            # Extract abstract
            abstract_elems = article.findall(".//AbstractText")
            abstract_parts = []
            for elem in abstract_elems:
                if elem.text:
                    abstract_parts.append(elem.text.strip())
            abstract = " ".join(abstract_parts) if abstract_parts else "Abstract not available"
            
            abstracts[pmid] = {"title": title, "abstract": abstract}

    return abstracts

# Function to rank top 20 papers using Gemini AI
def rank_papers_with_gemini(paper_data):
    prompt = """Rank the following PubMed research papers based on relevance and quality. 
Return ONLY a list of top 20 PMIDs in numerical order (no explanations or formatting).\n\n"""
    
    for pmid, details in paper_data.items():
        title = details.get('title', "Title not available") or "Title not available"
        abstract = details.get('abstract', "Abstract not available") or "Abstract not available"
        
        prompt += f"PMID: {pmid}\nTitle: {title}\nAbstract: {abstract[:1000]}\n\n"

    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    
    # Extract all PMIDs from response using regex
    ranked_pmids = re.findall(r'\d+', response.text)
    # Remove duplicates while preserving order
    seen = set()
    unique_pmids = [x for x in ranked_pmids if not (x in seen or seen.add(x))]
    return unique_pmids[:20]

# Function to fetch detailed metadata for the top PMIDs
def fetch_detailed_metadata(pmids):
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml"
    }
    response = requests.get(url, params=params)
    metadata = {}

    if response.status_code == 200:
        root = ET.fromstring(response.text)
        
        for article in root.findall(".//PubmedArticle"):
            # Extract PMID
            pmid_elem = article.find(".//PMID")
            pmid = pmid_elem.text if pmid_elem is not None else "N/A"

            # Extract title
            title_elem = article.find(".//ArticleTitle")
            title = title_elem.text if title_elem is not None else "Title not available"

            # Extract journal
            journal_elem = article.find(".//Journal/Title")
            journal = journal_elem.text if journal_elem is not None else "Journal not available"

            # Extract publication date
            year_elem = article.find(".//PubDate/Year")
            month_elem = article.find(".//PubDate/Month")
            pub_date = f"{year_elem.text}-{month_elem.text}" if year_elem and month_elem else "Unknown"

            # Extract authors
            authors = []
            for author in article.findall(".//Author"):
                last_name = author.findtext("LastName")
                fore_name = author.findtext("ForeName")
                initials = author.findtext("Initials")
                
                if last_name:
                    name = f"{last_name}"
                    if fore_name:
                        name += f" {fore_name}"
                    elif initials:
                        name += f" {initials}"
                    authors.append(name)
                else:
                    collective = author.findtext("CollectiveName")
                    if collective:
                        authors.append(collective)

            metadata[pmid] = {
                "title": title,
                "journal": journal,
                "publication_date": pub_date,
                "authors": authors
            }

    return metadata

# Function to summarize papers using Gemini AI
def summarize_papers_with_gemini(paper_data):
    prompt = """Convert the following PubMed papers into a JSON array of objects. Each object must contain:
- PMID (string)
- Title (string)
- Journal (string)
- PublicationDate (string)
- Authors (array of strings)
- Summary (2-3 sentence summary of the paper's key findings)

Format exactly like this (without markdown):
[
  {
    "PMID": "123456",
    "Title": "Paper Title",
    "Journal": "Journal Name",
    "PublicationDate": "2024-01",
    "Authors": ["Smith J", "Doe A"],
    "Summary": "Key findings summary..."
  }
]

Papers:\n\n"""
    
    for pmid, details in paper_data.items():
        prompt += f"PMID: {pmid}\n"
        prompt += f"Title: {details['title']}\n"
        prompt += f"Journal: {details['journal']}\n"
        prompt += f"Publication Date: {details['publication_date']}\n"
        prompt += f"Authors: {', '.join(details['authors'])}\n\n"

    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    
    try:
        # Clean response text
        json_str = response.text.strip().strip('`').replace('json\n', '')
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"JSON parsing failed: {e}")
        print(f"Response content: {response.text}")
        return {"error": "Failed to parse summary response"}

# Main function to execute the process
def get_best_pubmed_research(query):
    print("🔍 Searching PubMed...")
    pmids = search_pubmed(query)

    if not pmids:
        print("⚠️ No results found.")
        return {}

    print(f"📄 Retrieved {len(pmids)} articles. Fetching abstracts...")
    paper_data = fetch_abstracts(pmids)

    print("🤖 Ranking papers with Gemini AI...")
    top_pmids = rank_papers_with_gemini(paper_data)

    if not top_pmids:
        print("⚠️ No papers ranked by Gemini.")
        return {}

    print(f"📑 Fetching detailed metadata for top {len(top_pmids)} papers...")
    detailed_metadata = fetch_detailed_metadata(top_pmids)

    print("📜 Summarizing using Gemini AI...")
    final_summary = summarize_papers_with_gemini(detailed_metadata)

    return final_summary

# Example Usage
if __name__ == "__main__":
    query = "breast cancer biomarkers"
    best_papers = get_best_pubmed_research(query)
    print(json.dumps(best_papers, indent=4, ensure_ascii=False))