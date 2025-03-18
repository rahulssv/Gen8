
import { useState } from 'react';
import ArticleCard, { Article } from './ArticleCard';
import { FileText } from 'lucide-react';

interface ReferencesDisplayProps {
  references: Article[];
  onSelectArticle: (id: string, selected: boolean) => void;
  onGenerateSummary: () => void;
}

const ReferencesDisplay = ({ references, onSelectArticle, onGenerateSummary }: ReferencesDisplayProps) => {
  if (references.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">References</h3>
      <div className="space-y-6">
        {references.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onSelect={onSelectArticle}
          />
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-bioquery-50 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-bioquery-600 mr-2" />
          <span>
            <span className="font-medium">{references.length}</span> references found
          </span>
        </div>
        
        <button
          onClick={onGenerateSummary}
          className="button-transition py-2 px-4 rounded-lg bg-bioquery-600 text-white font-medium hover:bg-bioquery-700 focus:outline-none focus:ring-2 focus:ring-bioquery-500 focus:ring-offset-2"
        >
          Generate Summary
        </button>
      </div>
    </div>
  );
};

export default ReferencesDisplay;
