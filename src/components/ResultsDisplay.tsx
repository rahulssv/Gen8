
import { useState } from 'react';
import { Article } from './ArticleCard';
import SummaryGenerator from './SummaryGenerator';
import GeminiResultsDisplay from './GeminiResultsDisplay';
import ReferencesDisplay from './ReferencesDisplay';
import { parseReferencesFromGeminiResponse } from '@/utils/formatUtils';
import { Search } from 'lucide-react';

interface ResultsDisplayProps {
  query: string;
  onBack: () => void;
  geminiResponse: string | null;
  isLoading: boolean;
}

const ResultsDisplay = ({ query, onBack, geminiResponse, isLoading }: ResultsDisplayProps) => {
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  
  const handleSelectArticle = (id: string, selected: boolean) => {
    if (selected) {
      const articleToAdd = extractedReferences.find(article => article.id === id);
      if (articleToAdd) {
        setSelectedArticles([...selectedArticles, articleToAdd]);
      }
    } else {
      setSelectedArticles(selectedArticles.filter(article => article.id !== id));
    }
  };
  
  const handleGenerateSummary = () => {
    setShowSummary(true);
  };
  
  const handleBackToResults = () => {
    setShowSummary(false);
  };

  // Parse the Gemini response to extract references
  const extractedReferences: Article[] = geminiResponse 
    ? parseReferencesFromGeminiResponse(geminiResponse)
    : [];

  if (showSummary) {
    return (
      <SummaryGenerator 
        query={query}
        selectedArticles={selectedArticles.length > 0 ? selectedArticles : extractedReferences}
        onBack={handleBackToResults}
        geminiResponse={geminiResponse}
      />
    );
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-6 animate-fade-in">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-bioquery-600 hover:text-bioquery-700 transition-colors mr-4"
        >
          <Search className="w-5 h-5 mr-2" />
          New Search
        </button>
        
        <h2 className="text-xl font-semibold">
          Results for <span className="text-bioquery-600">"{query}"</span>
        </h2>
      </div>
      
      <GeminiResultsDisplay 
        geminiResponse={geminiResponse} 
        isLoading={isLoading}
        query={query}
      />
      
      {!isLoading && geminiResponse && (
        <ReferencesDisplay 
          references={extractedReferences}
          onSelectArticle={handleSelectArticle}
          onGenerateSummary={handleGenerateSummary}
        />
      )}
    </div>
  );
};

export default ResultsDisplay;
