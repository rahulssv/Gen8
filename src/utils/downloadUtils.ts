
import { Article } from '@/components/ArticleCard';

export const downloadSummary = (query: string, geminiResponse: string | null, articles: Article[]) => {
  // Prepare the content for download
  let content = `# Biomedical Analysis for: ${query}\n\n`;
  
  // Add Gemini response if available
  if (geminiResponse) {
    content += `${geminiResponse}\n\n`;
  }
  
  // Add references
  content += `## References\n\n${articles.map((article, index) => (
    `${index + 1}. ${article.authors.join(', ')}. (${article.year}). ${article.title}. ${article.journal}. ${article.url}`
  )).join('\n\n')}`;
  
  // Create and trigger download
  const element = document.createElement("a");
  const file = new Blob([content], { type: 'text/markdown' });
  element.href = URL.createObjectURL(file);
  element.download = "bioquery-summary.md";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
