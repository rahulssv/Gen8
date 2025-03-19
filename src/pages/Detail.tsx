
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { fetchGeminiResults } from '@/services/geminiService';
import { formatResponseWithLinks } from '@/utils/formatUtils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const Detail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const query = searchParams.get('query');
  const context = searchParams.get('context');
  
  const [isLoading, setIsLoading] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  
  useEffect(() => {
    // Load API key from localStorage if available
    const savedApiKey = localStorage.getItem("bioquery_gemini_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      fetchDetails(savedApiKey);
    } else {
      toast({
        title: "API Key Required",
        description: "Please return to the main page and set your Gemini API key.",
        variant: "destructive",
      });
    }
  }, [query]);
  
  const fetchDetails = async (key: string) => {
    if (!query) return;
    
    setIsLoading(true);
    
    try {
      // Modify the prompt for deeper analysis of specific entity
      const detailPrompt = `Provide a detailed analysis of ${query} in the context of ${context || 'biomedical research'}. 
      Include specific details, clinical implications, research findings, and any relevant questions a researcher might ask about this topic.
      
      Format your response into sections: 
      1. Summary
      2. Key Details
      3. Clinical Implications
      4. Research Questions
      5. References`;
      
      const response = await fetchGeminiResults(detailPrompt, key);
      setGeminiResponse(response);
    } catch (error) {
      console.error("Error fetching details:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get results from Gemini API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate some example questions from the response
  const generateQuestions = () => {
    if (!geminiResponse) return [];
    
    // Try to extract the "Research Questions" section or generate generic questions
    const questionsSection = geminiResponse.match(/Research Questions:?([\s\S]*?)(?=References:|$)/i);
    
    if (questionsSection && questionsSection[1].trim()) {
      // Extract questions from the section
      return questionsSection[1]
        .split(/\n\s*-\s*/)
        .filter(q => q.trim().length > 0 && q.trim().endsWith('?'))
        .map(q => q.trim());
    } else {
      // Generate generic questions based on the query
      return [
        `What are the latest research findings on ${query}?`,
        `How does ${query} impact patient outcomes?`,
        `What are the mechanisms of action for ${query}?`,
        `Are there any clinical trials involving ${query}?`,
        `What are the statistical efficacy rates for ${query}?`
      ];
    }
  };
  
  const questions = generateQuestions();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto py-8 px-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-bioquery-600 hover:text-bioquery-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <h1 className="text-2xl font-bold mb-2">{query}</h1>
          {context && (
            <p className="text-muted-foreground">
              Context: {context}
            </p>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-bioquery-200 border-t-bioquery-600 rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Analyzing with Gemini AI...</p>
          </div>
        ) : geminiResponse ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white border rounded-lg shadow-subtle p-6 mb-6">
                <div 
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatResponseWithLinks(geminiResponse) }}
                />
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-white border rounded-lg shadow-subtle p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Research Questions</h3>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-3">
                        <p className="text-sm">{question}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {query && (
                <div className="bg-white border rounded-lg shadow-subtle p-6">
                  <h3 className="text-lg font-semibold mb-4">External Resources</h3>
                  <div className="space-y-2">
                    <ResourceLink 
                      title="PubMed" 
                      url={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`} 
                    />
                    <ResourceLink 
                      title="ClinicalTrials.gov" 
                      url={`https://clinicaltrials.gov/search?term=${encodeURIComponent(query)}`} 
                    />
                    <ResourceLink 
                      title="Google Scholar" 
                      url={`https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {apiKey 
                ? "No data available. Please try a different search." 
                : "Please set your Gemini API key on the main page to see results."}
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-bioquery-600 hover:text-bioquery-700 transition-colors"
            >
              Return to main page
            </button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

// Renamed the component to avoid conflict with the imported icon
const ResourceLink = ({ title, url }: { title: string, url: string }) => {
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 border rounded-md hover:bg-bioquery-50 transition-colors"
    >
      <span className="font-medium">{title}</span>
      <ExternalLinkIcon size={16} className="text-muted-foreground" />
    </a>
  );
};

export default Detail;
