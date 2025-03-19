import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';
import SummaryCard from '@/components/SummaryCard';
import VisualizationCard from '@/components/VisualizationCard';
import DrugsAndTreatmentsCard from '@/components/DrugsAndTreatmentsCard';
import ClinicalTrialsCard from '@/components/ClinicalTrialsCard';
import DiseaseAssociationsCard from '@/components/DiseaseAssociationsCard';
import CoexistingBiomarkersCard from '@/components/CoexistingBiomarkersCard';
import QASection from '@/components/QASection';
import ChatbotPanel from '@/components/ChatbotPanel';
import { searchArticles } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Article, QueryResult } from '@/utils/types';
import { Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import drugsDataJson from '../../../backend/json/DrugsData.json';
import trialsDataJson from '../../../backend/json/TrialsData.json';
import diseaseDataJson from '../../../backend/json/DisseaseData.json';
import coexistingDataJson from '../../../backend/json/CoexistingData.json';

// Define types for the imported JSON data
interface Drug {
  name: string;
  type: string;
  mechanism: string;
  efficacy: string;
  approvalStatus: string;
  url?: string;
}

interface ClinicalTrial {
  id: string;
  title: string;
  phase: string;
  status: string;
  locations: string[];
  startDate: string;
  primaryCompletion?: string;
  interventions: string[];
  url: string;
}

interface DiseaseAssociation {
  disease: string;
  relationship: string;
  strength: 'Strong' | 'Moderate' | 'Weak';
  evidence: string;
  notes?: string;
}

interface CoexistingBiomarker {
  name: string;
  type: string;
  effect: 'Synergistic' | 'Antagonistic' | 'No effect' | 'Variable';
  clinicalImplication: string;
  frequencyOfCooccurrence?: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Initialize state with typed JSON data
  const [drugsData] = useState<Drug[]>(drugsDataJson);
  const [trialsData] = useState<ClinicalTrial[]>(trialsDataJson);
  const [diseaseData] = useState<DiseaseAssociation[]>(diseaseDataJson);
  const [coexistingData] = useState<CoexistingBiomarker[]>(coexistingDataJson);

  const query = new URLSearchParams(location.search).get('q') || '';

  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await searchArticles(searchQuery);
      setResult(data);
      setSelectedArticles(data.articles.map(article => article.id));
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to fetch results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(query);
  }, [query]);

  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticles(prev => 
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const getSelectedArticles = (): Article[] => {
    return result?.articles.filter(article => selectedArticles.includes(article.id)) || [];
  };

  const toggleChatbot = () => {
    setChatbotOpen(prev => !prev);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div className="w-full">
            <SearchBar />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-insight-500 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Searching databases and analyzing results...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg inline-block">
              {error}
            </div>
          </div>
        ) : result ? (
          <div className="space-y-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Results for: <span className="text-insight-600">{query}</span>
              </h1>
              <div className="flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-300">
                  Found {result.articles.length} articles from multiple databases. Select articles to include in your analysis.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 flex items-center gap-2"
                  onClick={toggleChatbot}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Ask AI Assistant</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Source Articles
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-white dark:bg-gray-800">
                      {selectedArticles.length} selected
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {result.articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      selected={selectedArticles.includes(article.id)}
                      onClick={() => toggleArticleSelection(article.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
                    <TabsTrigger value="treatments" className="flex-1">Treatments</TabsTrigger>
                    <TabsTrigger value="connections" className="flex-1">Connections</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="space-y-6">
                    <SummaryCard result={result} />
                    <QASection questions={result.aiGeneratedQuestions} />
                  </TabsContent>
                  
                  <TabsContent value="treatments" className="space-y-6">
                    <DrugsAndTreatmentsCard drugs={drugsData} />
                    <ClinicalTrialsCard trials={trialsData} />
                  </TabsContent>
                  
                  <TabsContent value="connections" className="space-y-6">
                    <DiseaseAssociationsCard associations={diseaseData} />
                    <CoexistingBiomarkersCard biomarkers={coexistingData} />
                    <VisualizationCard result={result} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      
      {result && chatbotOpen && (
        <ChatbotPanel 
          result={result}
          isOpen={chatbotOpen}
          onClose={() => setChatbotOpen(false)}
        />
      )}
    </div>
  );
};

export default Results;