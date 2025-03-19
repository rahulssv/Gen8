
import { Button } from '@/components/ui/button';

interface QueryInfoProps {
  query: string;
  hasGeminiResponse: boolean;
}

const QueryInfo = ({ query, hasGeminiResponse }: QueryInfoProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Biomedical Analysis</h2>
      <p className="text-muted-foreground">
        Query: <span className="text-foreground">{query}</span>
      </p>
      {hasGeminiResponse && (
        <p className="text-sm text-bioquery-600 mt-1">
          Generated by Gemini AI
        </p>
      )}
    </div>
  );
};

export default QueryInfo;
