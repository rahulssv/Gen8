
import { formatResponseWithLinks } from '@/utils/formatUtils';

interface GeminiResultsDisplayProps {
  geminiResponse: string | null;
  isLoading: boolean;
}

const GeminiResultsDisplay = ({ geminiResponse, isLoading }: GeminiResultsDisplayProps) => {
  if (isLoading) {
    return (
      <div className="mb-6 p-6 bg-white border rounded-lg shadow-subtle">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-bioquery-200 border-t-bioquery-600 rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Analyzing biomedical data with Gemini...</p>
        </div>
      </div>
    );
  }

  if (!geminiResponse) return null;

  return (
    <div className="mb-6 p-6 bg-white border rounded-lg shadow-subtle">
      <h3 className="text-lg font-medium mb-3">Biomedical Analysis</h3>
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
    </div>
  );
};

export default GeminiResultsDisplay;
