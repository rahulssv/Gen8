
import { Article } from '@/utils/types';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ArticleCardProps {
  article: Article;
  onClick?: () => void;
  selected?: boolean;
}

const ArticleCard = ({ article, onClick, selected = false }: ArticleCardProps) => {
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'PubMed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Taylor & Francis':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Science Direct':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer ${
        selected 
          ? 'border-insight-500 ring-1 ring-insight-500/30' 
          : 'border-gray-200 dark:border-gray-800 hover:border-insight-300'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <Badge variant="outline" className={`px-2 py-0.5 text-xs font-medium ${getSourceColor(article.source)}`}>
              {article.source}
            </Badge>
            {article.relevanceScore && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {Math.round(article.relevanceScore * 100)}% match
              </span>
            )}
          </div>
          <h3 className="font-medium text-base text-gray-900 dark:text-white line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {article.abstract}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <span>{article.journal} ({article.year})</span>
        </div>
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-insight-600 hover:text-insight-700 flex items-center text-sm font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          <FileText className="w-3.5 h-3.5 mr-1" />
          View
        </a>
      </CardFooter>
    </Card>
  );
};

export default ArticleCard;
