
import { useState } from 'react';
import { Article } from './ArticleCard';
import SummaryGenerator from './SummaryGenerator';
import ApiKeyInput from './ApiKeyInput';
import GeminiResultsDisplay from './GeminiResultsDisplay';
import ReferencesDisplay from './ReferencesDisplay';
import GeminiInsightButton from './GeminiInsightButton';
import { fetchGeminiResults } from '@/services/geminiService';
import { parseReferencesFromGeminiResponse } from '@/utils/formatUtils';
import { Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ResultsDisplayProps {
  query: string;
  onBack: () => void;
}

const ResultsDisplay = ({ query, onBack }: ResultsDisplayProps) => {
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [showSummary, setShowSummary] = useState(false);
  const { toast } = useToast();
  
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

  const fetchGeminiCuration = async () => {
    setGeminiLoading(true);
    setGeminiResponse(null);

    try {
      const response = await fetchGeminiResults(query, apiKey);
      setGeminiResponse(response);
    } catch (error) {
      console.error("Error fetching from Gemini:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get results from Gemini API",
        variant: "destructive",
      });
    } finally {
      setGeminiLoading(false);
    }
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
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
      
      <ApiKeyInput onApiKeyChange={handleApiKeyChange} />
      
      {apiKey && !geminiResponse && !geminiLoading && (
        <GeminiInsightButton 
          onGetInsights={fetchGeminiCuration} 
          apiKey={apiKey} 
        />
      )}
      
      <GeminiResultsDisplay 
        geminiResponse={geminiResponse} 
        isLoading={geminiLoading} 
      />
      
      <ReferencesDisplay 
        references={extractedReferences}
        onSelectArticle={handleSelectArticle}
        onGenerateSummary={handleGenerateSummary}
      />
    </div>
  );
};

export default ResultsDisplay;
