
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

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Mock data for the new cards
  const [drugsData, setDrugsData] = useState([
    {
      name: "Encorafenib (Braftovi)",
      type: "BRAF inhibitor",
      mechanism: "Selectively inhibits BRAF V600E kinase activity",
      efficacy: "Median OS of 9.3 months as monotherapy",
      approvalStatus: "FDA Approved",
      url: "https://www.braftovi.com/"
    },
    {
      name: "Cetuximab (Erbitux)",
      type: "EGFR inhibitor (monoclonal antibody)",
      mechanism: "Binds to EGFR and blocks ligand binding",
      efficacy: "Objective response rate of 26.8% when combined with encorafenib",
      approvalStatus: "FDA Approved",
      url: "https://www.erbitux.com/"
    },
    {
      name: "Binimetinib (Mektovi)",
      type: "MEK inhibitor",
      mechanism: "Inhibits MEK1 and MEK2 activation and kinase activity",
      efficacy: "Marginal additional benefit when added to encorafenib and cetuximab",
      approvalStatus: "FDA Approved",
      url: "https://www.mektovi.com/"
    }
  ]);

  const [trialsData, setTrialsData] = useState([
    {
      id: "NCT01719380",
      title: "BEACON CRC Study: A Phase 3 Trial of Encorafenib and Cetuximab With or Without Binimetinib",
      phase: "3",
      status: "Completed",
      locations: ["United States", "Europe", "Asia"],
      startDate: "Oct 2016",
      primaryCompletion: "Feb 2019",
      interventions: ["Encorafenib", "Cetuximab", "Binimetinib"],
      url: "https://clinicaltrials.gov/ct2/show/NCT01719380"
    },
    {
      id: "NCT04044430",
      title: "A Study of Encorafenib Plus Cetuximab in Subjects With Previously Untreated BRAF V600E-Mutant Metastatic Colorectal Cancer",
      phase: "2",
      status: "Recruiting",
      locations: ["MD Anderson Cancer Center", "Mayo Clinic", "MSKCC"],
      startDate: "Aug 2019",
      primaryCompletion: "Dec 2023",
      interventions: ["Encorafenib", "Cetuximab"],
      url: "https://clinicaltrials.gov/ct2/show/NCT04044430"
    }
  ]);

  const [diseaseData, setDiseaseData] = useState([
    {
      disease: "Colorectal Cancer",
      relationship: "BRAF V600E mutation is present in 8-12% of cases",
      strength: "Strong" as const,
      evidence: "Multiple large cohort studies with consistent findings",
      notes: "Associated with microsatellite instability and right-sided tumor location"
    },
    {
      disease: "Melanoma",
      relationship: "BRAF V600E mutation is present in approximately 50% of cases",
      strength: "Strong" as const,
      evidence: "Established biomarker with FDA-approved targeted therapies"
    },
    {
      disease: "Thyroid Cancer",
      relationship: "BRAF V600E mutation occurs in 40-45% of papillary thyroid carcinomas",
      strength: "Strong" as const,
      evidence: "Multiple clinical studies with consistent findings"
    }
  ]);

  const [coexistingData, setCoexistingData] = useState([
    {
      name: "KRAS mutation",
      type: "Oncogene mutation",
      effect: "Antagonistic" as const,
      clinicalImplication: "Reduces efficacy of BRAF inhibitors; typically mutually exclusive with BRAF V600E",
      frequencyOfCooccurrence: "Rare (<1%)"
    },
    {
      name: "PIK3CA mutation",
      type: "Oncogene mutation",
      effect: "Synergistic" as const,
      clinicalImplication: "May contribute to resistance to BRAF inhibitors; combination therapy targeting both pathways may be beneficial",
      frequencyOfCooccurrence: "10-15% of BRAF-mutant CRC"
    },
    {
      name: "Microsatellite Instability (MSI-H)",
      type: "Molecular phenotype",
      effect: "Variable" as const,
      clinicalImplication: "MSI-H tumors with BRAF V600E may respond better to immunotherapy than MSS BRAF-mutant tumors",
      frequencyOfCooccurrence: "~30% of BRAF-mutant CRC"
    }
  ]);

  // Get query from URL
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
      // Pre-select all articles by default
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
    if (!result) return [];
    return result.articles.filter(article => selectedArticles.includes(article.id));
  };

  const toggleChatbot = () => {
    setChatbotOpen(prev => !prev);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Search bar and back button */}
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
            {/* Query Info */}
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
              {/* Left column: Articles */}
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

              {/* Right column: Tabs for Analysis */}
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
      
      {/* Chatbot Panel */}
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
