
import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Article {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  abstract: string;
  url: string;
  selected?: boolean;
}

interface ArticleCardProps {
  article: Article;
  onSelect: (id: string, selected: boolean) => void;
}

const ArticleCard = ({ article, onSelect }: ArticleCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const handleSelect = () => {
    onSelect(article.id, !article.selected);
  };

  return (
    <div 
      className={cn(
        "relative w-full rounded-xl overflow-hidden transition-all duration-300 ease-apple bg-white border",
        article.selected ? "border-bioquery-400 shadow-[0_0_0_1px_theme(colors.bioquery.400)]" : "border-border hover:shadow-hover",
        "animate-scale-in"
      )}
    >
      {article.selected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-bioquery-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-10">
            <h3 className="font-semibold text-lg leading-tight mb-2">{article.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {article.authors.slice(0, 3).join(', ')}
              {article.authors.length > 3 ? ' et al.' : ''} • {article.journal} • {article.year}
            </p>
          </div>
        </div>
        
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-apple",
          expanded ? "max-h-96" : "max-h-20"
        )}>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {article.abstract}
          </p>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={toggleExpanded}
            className="flex items-center text-sm text-bioquery-600 hover:text-bioquery-700 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show more
              </>
            )}
          </button>
          
          <div className="flex items-center space-x-3">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-bioquery-600 hover:text-bioquery-700 transition-colors flex items-center"
            >
              View <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
            
            <button
              onClick={handleSelect}
              className={cn(
                "button-transition px-3 py-1 text-sm rounded-full font-medium",
                article.selected 
                  ? "bg-bioquery-100 text-bioquery-700 hover:bg-bioquery-200" 
                  : "bg-secondary text-muted-foreground hover:bg-bioquery-50 hover:text-bioquery-600"
              )}
            >
              {article.selected ? 'Selected' : 'Select'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
