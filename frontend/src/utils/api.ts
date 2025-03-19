
import { Article, QueryResult, ExtractionResult } from './types';
import qa from '../../../backend/json/QA.json'
import statistics from '../../../backend/json/Statistics.json'
import articles from '../../../backend/json/Articles.json'
import entities from '../../../backend/json/Entities.json'
import relations from '../../../backend/json/Relations.json'

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
    coexistingFactors: ["KRAS mutation", "MSI-H status", "PIK3CA mutation"],
    summary: `This article discusses the implications of various mutations in colorectal cancer treatment. 
              It highlights the importance of testing for BRAF V600E mutations and suggests potential 
              treatment options including encorafenib combined with cetuximab.`
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
  if (query.toLowerCase().includes('braf') && query.toLowerCase().includes('colorectal')) {
    return `Based on analysis of recent clinical research, the combination of encorafenib and cetuximab shows the most promising results for treating BRAF V600E-mutated colorectal cancer, with a median overall survival of 15 months compared to 10 months with standard therapy (HR 0.61, p=0.0003). This combination demonstrated an objective response rate of 26.8%. The addition of binimetinib (MEK inhibitor) to this combination showed marginal additional benefit in the BEACON CRC trial. Treatment efficacy is reduced when KRAS mutations coexist. Current evidence supports encorafenib plus cetuximab as the preferred treatment approach, though ongoing trials are exploring additional combinations with immunotherapy for potentially improved outcomes.`;
  }
  
  return `Based on analysis of the selected articles, the most effective treatment approach involves targeted therapy specific to the molecular profile of the disease. Multiple clinical trials have demonstrated improved outcomes with combination therapies that address specific pathways. Statistical analysis shows significant improvements in survival metrics compared to standard approaches. The research highlights the importance of comprehensive molecular testing to guide treatment decisions and optimize patient outcomes.`;
};

const generateMockQuestions = (query: string): any[] => {
  return qa;
};
