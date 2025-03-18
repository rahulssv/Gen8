
import { formatResponseWithLinks } from '@/utils/formatUtils';

interface SummaryContentProps {
  loading: boolean;
  articleCount: number;
  geminiResponse: string | null;
}

const SummaryContent = ({ loading, articleCount, geminiResponse }: SummaryContentProps) => {
  if (loading) {
    return (
      <div className="py-10 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-bioquery-200 border-t-bioquery-600 rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Generating your summary...</p>
        <p className="text-sm text-muted-foreground/70 mt-2">Analyzing {articleCount} articles</p>
      </div>
    );
  }

  if (!geminiResponse) {
    return (
      <div className="py-10 flex flex-col items-center justify-center">
        <p className="text-muted-foreground">No data available. Please use Gemini AI to generate insights.</p>
      </div>
    );
  }

  return (
    <div className="prose prose-slate max-w-none">
      {geminiResponse.split('\n\n').map((paragraph, i) => {
        // Check if this is a section header
        if (paragraph.includes("SUMMARY:") || 
            paragraph.includes("KEY FINDINGS:") || 
            paragraph.includes("REFERENCES:")) {
          return (
            <h4 key={i} className="text-bioquery-700 font-medium mt-4 mb-2">
              {paragraph.trim()}
            </h4>
          );
        }
        
        // Format bullet points
        if (paragraph.trim().startsWith("-")) {
          return (
            <ul key={i} className="list-disc pl-5 mb-3">
              <li dangerouslySetInnerHTML={{ __html: formatResponseWithLinks(paragraph.replace("-", "").trim()) }} 
                  className="mb-2 leading-relaxed text-foreground/90" />
            </ul>
          );
        }
        
        // Regular paragraph
        return (
          <p key={i} 
             dangerouslySetInnerHTML={{ __html: formatResponseWithLinks(paragraph) }}
             className="mb-4 leading-relaxed text-foreground/90" />
        );
      })}
    </div>
  );
};

export default SummaryContent;
