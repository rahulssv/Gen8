
import { Article, QueryResult, ExtractionResult } from './types';
import qa from '../../../backend/json/AIQuestion.json'
import statistics from '../../../backend/json/StatisticalData.json'
import articles from '../../../backend/json/Article.json'
import entities from '../../../backend/json/Entity.json'
import relations from '../../../backend/json/Relation.json'
import summary from '../../../backend/json/Summary.json'
import coexistingDatas from '../../../backend/json/CoexistingBiomarker.json'
// Mock API key storage - in a real app, this would be handled more securely
let storedApiKey: string | null = null;

export const setApiKey = (key: string): void => {
  storedApiKey = key;
  localStorage.setItem('insightmed_api_key', key);
};

export const getApiKey = (): string | null => {
  if (storedApiKey) return storedApiKey;
  return localStorage.getItem('insightmed_api_key');
};

// Mock API calls - these would be replaced with actual API calls
export const searchArticles = async (query: string): Promise<QueryResult> => {
  // In a real implementation, this would make a call to the Gemini API
  // using the stored API key
  
  // For now, we'll simulate a delay and return mock data
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock data
  return {
    query,
    articles: generateMockArticles(query),
    entities: generateMockEntities(query),
    statistics: generateMockStatistics(),
    summary: generateMockSummary(query),
    aiGeneratedQuestions: generateMockQuestions(query)
  };
};

export const analyzeSingleArticle = async (articleUrl: string): Promise<ExtractionResult> => {
  // In a real implementation, this would analyze a single article
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    entities: generateMockEntities(""),
    relations: generateMockRelations(),
    statistics: generateMockStatistics(),
    coexistingFactors: coexistingDatas.map((codata)=>codata.name),
    summary: summary
  };
};

export const generatePdfReport = async (result: QueryResult | ExtractionResult): Promise<string> => {
  // In a real implementation, this would generate a PDF
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // This would return a URL to the generated PDF
  return "https://example.com/report.pdf";
};

// Mock data generation helpers
const generateMockArticles = (query: string): Article[] => {
  const isCancer = query.toLowerCase().includes('cancer');
  const isBraf = query.toLowerCase().includes('braf');
  
  return articles ;
};

const generateMockEntities = (query: string): any[] => {
  return entities;
};

const generateMockRelations = (): any[] => {
  return relations;
};

const generateMockStatistics = (): any[] => {
  return statistics ;
};

const generateMockSummary = (query: string): string => {
  // if (query.toLowerCase().includes('braf') && query.toLowerCase().includes('colorectal')) {
  //   return `Based on analysis of recent clinical research, the combination of encorafenib and cetuximab shows the most promising results for treating BRAF V600E-mutated colorectal cancer, with a median overall survival of 15 months compared to 10 months with standard therapy (HR 0.61, p=0.0003). This combination demonstrated an objective response rate of 26.8%. The addition of binimetinib (MEK inhibitor) to this combination showed marginal additional benefit in the BEACON CRC trial. Treatment efficacy is reduced when KRAS mutations coexist. Current evidence supports encorafenib plus cetuximab as the preferred treatment approach, though ongoing trials are exploring additional combinations with immunotherapy for potentially improved outcomes.`;
  // }
  
  return summary;
};

const generateMockQuestions = (query: string): any[] => {
  return qa;
};
