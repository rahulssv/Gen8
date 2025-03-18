
import { useState, useEffect } from 'react';
import { Article } from './ArticleCard';
import SummaryHeader from './summary/SummaryHeader';
import QueryInfo from './summary/QueryInfo';
import SummaryContent from './summary/SummaryContent';
import ReferencesList from './summary/ReferencesList';
import { downloadSummary } from '@/utils/downloadUtils';

interface SummaryGeneratorProps {
  query: string;
  selectedArticles: Article[];
  onBack: () => void;
  geminiResponse?: string | null;
}

const SummaryGenerator = ({ query, selectedArticles, onBack, geminiResponse }: SummaryGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // No need for mock data generation since we're using Gemini's response
    setLoading(false);
  }, [selectedArticles, geminiResponse]);
  
  const handleDownload = () => {
    downloadSummary(query, geminiResponse || null, selectedArticles);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-6 animate-fade-in">
      <SummaryHeader 
        onBack={onBack}
        onDownload={handleDownload}
        loading={loading}
      />
      
      <QueryInfo 
        query={query}
        hasGeminiResponse={!!geminiResponse}
      />
      
      <div className="bg-white border rounded-xl overflow-hidden shadow-subtle mb-8">
        <div className="p-6">
          <SummaryContent
            loading={loading}
            articleCount={selectedArticles.length}
            geminiResponse={geminiResponse || null}
          />
        </div>
      </div>
      
      <ReferencesList articles={selectedArticles} />
    </div>
  );
};

export default SummaryGenerator;
