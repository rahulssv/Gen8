import requests
import re
import json
import google.generativeai as genai  # Gemini API

# Configure Gemini API
genai.configure(api_key="AIzaSyA7FzIqNJdPHT4MlutG-10deT0vBclCChw")

# Fetch relevant PMIDs
def fetch_pubmed_pmids(query, max_results=100):
    print("[DEBUG] Fetching PMIDs...")
    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": f"{query} AND hasabstract[text] AND (free full text[Filter] OR open access[Filter])",
        "retmode": "json",
        "retmax": max_results
    }
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        pmid_list = data.get("esearchresult", {}).get("idlist", [])
        print(f"[DEBUG] Total relevant PMIDs found: {len(pmid_list)}")
        return pmid_list
    except Exception as e:
        print(f"[ERROR] Fetching PMIDs: {e}")
        return []

# Fetch titles and journals of papers
def fetch_pubmed_details(pmids):
    print("[DEBUG] Fetching titles and journal names...")
    details = {}
    summary_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
    params = {"db": "pubmed", "id": ",".join(pmids), "retmode": "json"}
    try:
        response = requests.get(summary_url, params=params)
        response.raise_for_status()
        summary_data = response.json().get("result", {})
        for pmid in pmids:
            details[pmid] = {
                "title": summary_data.get(pmid, {}).get("title", "Title not available"),
                "journal": summary_data.get(pmid, {}).get("source", "Unknown Journal")
            }
    except Exception as e:
        print(f"[ERROR] Fetching details: {e}")
    return details

# Use LLM to select at least 5 most relevant papers
def select_top_papers_with_gemini(details, query):
    print("[DEBUG] Selecting top papers...")
    prompt = f"Select the most relevant PubMed papers for: {query}\n\n"
    for pmid, info in details.items():
        prompt += f"PMID: {pmid}\nTitle: {info['title']}\nJournal: {info['journal']}\n\n"
    
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    selected_pmids = re.findall(r'\d+', response.text)
    return [pmid for pmid in selected_pmids if pmid in details][:5]

# Fetch summaries for selected papers
def fetch_pubmed_summaries(pmids):
    print("[DEBUG] Fetching summaries...")
    summaries = {}
    abstract_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    
    for pmid in pmids:
        params = {"db": "pubmed", "id": pmid, "retmode": "text", "rettype": "abstract"}
        try:
            response = requests.get(abstract_url, params=params)
            response.raise_for_status()
            summaries[pmid] = response.text.strip()
        except Exception as e:
            print(f"[ERROR] Fetching abstract for PMID {pmid}: {e}")
    
    return summaries

# Use LLM for deep search to refine selection
def deep_search_with_gemini(summaries, query):
    print("[DEBUG] Performing deep search...")
    prompt = f"Deep search: Select the most relevant PubMed papers for: {query}\n\n"
    for pmid, summary in summaries.items():
        prompt += f"PMID: {pmid}\nAbstract: {summary}\n\n"
    
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    best_pmids = re.findall(r'\d+', response.text)
    return [pmid for pmid in best_pmids if pmid in summaries][:5]

# Generate best articles JSON
def generate_best_articles_json(best_pmids, summaries, details):
    print("[DEBUG] Saving best articles...")
    best_articles = []
    for pmid in best_pmids:
        best_articles.append({
            "id": pmid,
            "title": details.get(pmid, {}).get("title", "Title not available"),
            "authors": [],  # Placeholder for author names if needed
            "journal": details.get(pmid, {}).get("journal", "Unknown Journal"),
            "year": None,  # Placeholder for publication year
            "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
            "abstract": summaries.get(pmid, "No abstract available."),
            "source": "PubMed",
            "relevanceScore": None  # Placeholder for calculated score
        })
    
    with open("articles.json", "w") as f:
        json.dump(best_articles, f, indent=4)
    print("Saved best articles to 'articles.json'.")

# Main execution
def main():
    user_query = input("Enter your PubMed search query: ")
    pmids = fetch_pubmed_pmids(user_query, max_results=100)
    details = fetch_pubmed_details(pmids)
    selected_pmids = select_top_papers_with_gemini(details, user_query)
    summaries = fetch_pubmed_summaries(selected_pmids)
    best_pmids = deep_search_with_gemini(summaries, user_query)
    generate_best_articles_json(best_pmids, summaries, details)

if __name__ == "__main__":
    main()