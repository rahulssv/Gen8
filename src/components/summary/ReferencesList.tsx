
import { Article } from '../ArticleCard';

interface ReferencesListProps {
  articles: Article[];
}

const ReferencesList = ({ articles }: ReferencesListProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">References</h3>
      <div className="space-y-4">
        {articles.map((article, index) => (
          <div key={article.id} className="flex">
            <div className="mr-3 text-muted-foreground">{index + 1}.</div>
            <div>
              <p className="text-foreground font-medium">{article.title}</p>
              <p className="text-sm text-muted-foreground">
                {article.authors.join(', ')} • {article.journal} • {article.year}
              </p>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-bioquery-600 hover:text-bioquery-700 transition-colors mt-1 inline-block"
              >
                View source
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferencesList;
