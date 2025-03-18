
import { Article } from '@/components/ArticleCard';

// Function to format links in the Gemini response
export const formatResponseWithLinks = (text: string) => {
  if (!text) return "";
  
  // Format PMID links
  let formatted = text.replace(/PMID:\s*(\d+)/g, 
    'PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/$1/" target="_blank" class="text-bioquery-600 hover:underline">$1</a>');
  
  // Format DOI links
  formatted = formatted.replace(/(https?:\/\/doi\.org\/[^\s]+)/g, 
    '<a href="$1" target="_blank" class="text-bioquery-600 hover:underline">$1</a>');
  
  // Format regular URLs
  formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" class="text-bioquery-600 hover:underline">$1</a>');
  
  return formatted;
};

// Helper function to parse references from Gemini response
export const parseReferencesFromGeminiResponse = (response: string): Article[] => {
  const refs: Article[] = [];
  
  // Look for the REFERENCES section
  const referencesSection = response.split("REFERENCES:")[1] || 
                            response.split("REFERENCES")[1] || 
                            response.split("References:")[1] ||
                            response.split("References")[1];
  
  if (!referencesSection) return refs;
  
  // Extract reference lines
  const lines = referencesSection.split('\n').filter(line => 
    line.trim().length > 0 && 
    (line.includes("[") || line.includes("PMID") || line.includes("doi"))
  );
  
  lines.forEach((line, index) => {
    // Extract parts from each reference
    const authors = line.match(/([A-Za-z\s]+et al\.)/)?.[0] || "Various Authors";
    const year = line.match(/\((\d{4})\)/)?.[1] || "N/A";
    
    // Extract title - anything between the year and the journal
    const titleMatch = line.match(/\)\s*(.+?)\s*\./);
    const title = titleMatch?.[1] || `Reference ${index + 1}`;
    
    // Extract journal
    const journalMatch = line.match(/\.\s*([^\.]+)\./);
    const journal = journalMatch?.[1] || "Medical Journal";
    
    // Extract URL/PMID
    const urlMatch = line.match(/https?:\/\/[^\s]+/) || 
                    line.match(/doi\.org\/[^\s]+/) || 
                    line.match(/PMID:\s*\d+/);
    const url = urlMatch ? urlMatch[0] : "https://pubmed.ncbi.nlm.nih.gov/";
    
    // Create Article object
    refs.push({
      id: `ref-${index + 1}`,
      title,
      authors: authors.split(',').map(a => a.trim()),
      journal,
      year: parseInt(year) || new Date().getFullYear(),
      abstract: "Abstract available in the full paper.",
      url: url.startsWith("PMID") ? `https://pubmed.ncbi.nlm.nih.gov/${url.replace("PMID:", "").trim()}/` : url,
      selected: false
    });
  });
  
  return refs;
};
