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
import { searchArticles } from '@/api/api';
import { Button } from '@/components/ui/button';
import { Article, QueryResult, Drug, ClinicalTrial, DiseaseAssociation, CoexistingBiomarker } from '@/api/types';
import { Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import drugsDataJson from '../../../backend/json/Drug.json';
import trialsDataJson from '../../../backend/json/ClinicalTrial.json';
import diseaseDataJson from '../../../backend/json/DiseaseAssociation.json';
import coexistingDataJson from '../../../backend/json/CoexistingBiomarker.json';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const [drugsData, setDrugsData] = useState<Drug[]>([]);
  // const [trialsData, setTrialsData] = useState<ClinicalTrial[]>([]);
  const [diseaseData, setDiseaseData] = useState<DiseaseAssociation[]>([]);
  // const [coexistingData, setCoexistingData] = useState<CoexistingBiomarker[]>([]);

  const query = new URLSearchParams(location.search).get('q') || '';
  localStorage.setItem('query', query);

  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const queryParam = localStorage.getItem('query');
      const data = await searchArticles(searchQuery);
      setResult(data);
      setSelectedArticles(data.articles.map(article => article.id));
      const drugDataResponse = await axios.get(`${API_BASE_URL}/drugs?query=` + queryParam);
      const drugData: Drug[] = drugDataResponse.data.map((item: any) => ({
        name: item?.name,
        type: item?.type,
        mechanism: item?.mechanism,
        efficacy: item?.efficacy,
        approvalStatus: item?.approvalStatus,
        url: item?.url,
      })
      )
      setDrugsData(drugData);

      //   const trialDataResponse = await axios.get(`${API_BASE_URL}/drugs?query=` + queryParam);
      //   const trialData : ClinicalTrial[] = trialDataResponse.data.map((item: any) => ({
      //     name: item?.name,
      //     type: item?.type,
      //     mechanism: item?.mechanism,
      //     efficacy: item?.efficacy,
      //     approvalStatus: item?.approvalStatus,
      //     url: item?.url,
      //   })
      // )
      //   setTrialsData(trialData);

      const diseasesDataResponse = await axios.get(`${API_BASE_URL}/disease?query=` + queryParam);
      const diseasesData: DiseaseAssociation[] = diseasesDataResponse.data.map((item: any) => ({
        disease: item?.disease,
        relationship: item?.relationship,
        strength: item?.strength,
        evidence: item?.evidence,
        notes: item?.notes
      })
      )
      setDiseaseData(diseasesData);

      // const coexistingDatasResponse = await axios.get(`${API_BASE_URL}/co-biomarkers?query=` + queryParam);
      // const coexistingDatas: CoexistingBiomarker[] = coexistingDatasResponse.data.map((item: any) => ({
      //   name: item?.name,
      //   type: item?.type,
      //   effect: item?.effect,
      //   clinicalImplication: item?.clinicalImplication,
      //   frequencyOfCooccurrence: item?.frequencyOfCooccurrence
      // })
      // )
      // setCoexistingData(coexistingDatas);
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
                    {/* <ClinicalTrialsCard trials={trialsData} /> */}
                  </TabsContent>

                  <TabsContent value="connections" className="space-y-6">
                    <DiseaseAssociationsCard associations={diseaseData} />
                    {/* <CoexistingBiomarkersCard biomarkers={coexistingData} /> */}
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