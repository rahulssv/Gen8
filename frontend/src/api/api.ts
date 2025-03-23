import { Article, QueryResult, Entity, ExtractionResult, StatisticalData, AIQuestion } from './types';
import { HttpClient } from './httpClient';
import axios from 'axios';
import { API_BASE_URL } from './config';

const httpClient = new HttpClient();

// Auth utils (unchanged)
let storedApiKey: string | null = null;
export const setApiKey = (key: string): void => {
  storedApiKey = key;
  localStorage.setItem('insightmed_api_key', key);
};
export const getApiKey = (): string | null => {
  return storedApiKey || localStorage.getItem('insightmed_api_key');
};

// Mock data imports
import qa from '../../../backend/json/AIQuestion.json';
import statistics from '../../../backend/json/StatisticalData.json';
import articles from '../../../backend/json/Article.json';
import entities from '../../../backend/json/Entity.json';
import summary from '../../../backend/json/Summary.json';

// API service functions with mock fallbacks
export const searchArticles = async (query: string): Promise<QueryResult> => {
  try {
    // Make parallel API calls
    const queryParam = localStorage.getItem('query');
    const [
      articlesResponse,
      entitiesResponse,
      statsResponse,
      summaryResponse,
      qnaResponse
    ] = await Promise.all([
      axios.get(`${API_BASE_URL}/articles?query=${queryParam}`),
      axios.get(`${API_BASE_URL}/entities?query=${queryParam}`),
      axios.get(`${API_BASE_URL}/statistics?query=${queryParam}`),
      axios.get(`${API_BASE_URL}/summary?query=${queryParam}`),
      axios.get(`${API_BASE_URL}/getqna?query=${queryParam}`),
    ]);

    // Transform responses
    return {
      query,
      articles: articlesResponse.data.map(mapArticle),
      entities: entitiesResponse.data.map(mapEntity),
      statistics: statsResponse.data.map(mapStatistics),
      summary: summaryResponse.data,
      aiGeneratedQuestions: qnaResponse.data.map(mapQnA)
    };
  } catch (err) {
    console.error('API Error - Using mock data:', err);
    return {
      query,
      articles: generateArticles(query),
      entities: generateEntities(query),
      statistics: generateStatistics(),
      summary: generateSummary(query),
      aiGeneratedQuestions: generateQuestions(query)
    };
  }
};

export const analyzeSingleArticle = async (articleUrl: string): Promise<ExtractionResult> => {
  try {
    const response = await httpClient.request<any>('/process-article', {
      method: 'GET',
      queryParams: { url: articleUrl }
    });

    return {
      title: response.title,
      summary: response.summary,
      keywords: response.keywords,
      aiGeneratedQuestions: response.qna_pairs
    };
  } catch (error) {
    console.error('Article analysis failed:', error);
    throw new Error('Failed to analyze the article. Please try again.');
  }
};

// PDF report generation (unchanged)
export const generatePdfReport = async (result: QueryResult | ExtractionResult): Promise<string> => {
  try {
    const endpoint = 'articles' in result ? '/query-report' : '/extraction-report';
    const response = await httpClient.request<{ reportUrl: string }>(endpoint, {
      method: 'POST',
      body: result
    });
    return response.reportUrl;
  } catch (error) {
    return "https://example.com/report.pdf";
  }
};

// Helper functions and mappers
const mapArticle = (item: any): Article => ({
  id: item?.id,
  title: item?.title,
  authors: item?.authors,
  journal: item?.journal,
  year: item?.year,
  url: item?.url,
  abstract: item?.abstract,
  source: item?.source,
  relevanceScore: item?.relevanceScore
});

const mapEntity = (item: any): Entity => ({
  name: item?.name,
  type: item?.type,
  mentions: item?.mentions,
  relations: item?.relations
});

const mapStatistics = (item: any): StatisticalData => ({
  type: item?.type,
  value: item?.value,
  unit: item?.unit,
  context: item?.context
});

const mapQnA = (item: any): AIQuestion => ({
  question: item?.question,
  answer: item?.answer
});

// Mock generators (unchanged)
const generateArticles = (query: string): Article[] => articles;
const generateEntities = (query: string): Entity[] => entities;
const generateStatistics = (): StatisticalData[] => statistics;
const generateSummary = (query: string): string => summary;
const generateQuestions = (query: string): AIQuestion[] => qa;