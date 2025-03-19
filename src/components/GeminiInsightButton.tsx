
// This component is no longer needed as the search functionality 
// has been integrated directly into the search button.
// The file is kept but not used to avoid breaking imports.

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

  // This component is no longer used
  return null;
};

export default GeminiInsightButton;
