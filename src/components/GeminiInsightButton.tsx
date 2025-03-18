
import { useToast } from '@/components/ui/use-toast';

interface GeminiInsightButtonProps {
  onGetInsights: () => void;
  apiKey: string;
}

const GeminiInsightButton = ({ onGetInsights, apiKey }: GeminiInsightButtonProps) => {
  const { toast } = useToast();

  const handleClick = () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key to get biomedical research results.",
        variant: "destructive",
      });
      return;
    }
    
    onGetInsights();
  };

  if (!apiKey) return null;

  return (
    <div className="mb-6 p-4 bg-bioquery-50 rounded-lg">
      <p className="text-sm mb-3">
        Get AI-enhanced biomedical insights with Gemini. This will provide analysis of biomarkers, mutations, associated drugs, clinical trials, and statistical data.
      </p>
      <button
        onClick={handleClick}
        className="button-transition py-2 px-4 rounded-lg bg-bioquery-600 text-white font-medium hover:bg-bioquery-700 focus:outline-none focus:ring-2 focus:ring-bioquery-500 focus:ring-offset-2"
      >
        Get Gemini Insights
      </button>
    </div>
  );
};

export default GeminiInsightButton;
