import { Article, QueryResult, ExtractionResult, StatisticalData } from './types';
import { HttpClient } from './httpClient';

const httpClient = new HttpClient();

let storedApiKey: string | null = null;

export const setApiKey = (key: string): void => {
  storedApiKey = key;
  localStorage.setItem('insightmed_api_key', key);
};

export const getApiKey = (): string | null => {
  if (storedApiKey) return storedApiKey;
  return localStorage.getItem('insightmed_api_key');
};


// Mock data imports
import qa from '../../../backend/json/AIQuestion.json';
import statistics from '../../../backend/json/StatisticalData.json';
import articles from '../../../backend/json/Article.json';
import entities from '../../../backend/json/Entity.json';
import relations from '../../../backend/json/Relation.json';
import summary from '../../../backend/json/Summary.json';
import coexistingDatas from '../../../backend/json/CoexistingBiomarker.json';

// API service functions with mock fallbacks
export const searchArticles = async (query: string): Promise<QueryResult> => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const [articlesRes, entitiesRes, statisticsRes, summaryRes, questionsRes] = await Promise.all([
      httpClient.request<Article[]>('/articles', { queryParams: { query } }).catch(() => articles),
      httpClient.request<any[]>('/entities', { queryParams: { query } }).catch(() => entities),
      httpClient.request<any[]>('/statistics', { queryParams: {} }).catch(() => statistics),
      httpClient.request<string>('/summary', { queryParams: { query } }).catch(() => generateSummary(query)),
      httpClient.request<any[]>('/getqna', { queryParams: { query } }).catch(() => qa)
    ]);

    return {
      query,
      articles: articlesRes,
      entities: entitiesRes,
      statistics: statisticsRes,
      summary: summaryRes,
      aiGeneratedQuestions: questionsRes
    };
  } catch (error) {
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
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const [entitiesRes, relationsRes, statisticsRes, coexistingRes, summaryRes] = await Promise.all([
      httpClient.request<any[]>('/entities', { queryParams: { url: articleUrl } }).catch(() => entities),
      httpClient.request<any[]>('/relations', { queryParams: { url: articleUrl } }).catch(() => relations),
      httpClient.request<StatisticalData>('/statistics', { queryParams: { url: articleUrl } }).catch(() => statistics),
      httpClient.request<string[]>('/co_biomarkers', { queryParams: { url: articleUrl } })
        .catch(() => coexistingDatas.map(codata => codata.name)),
      httpClient.request<string>('/summary', { queryParams: { url: articleUrl } }).catch(() => summary)
    ]);

    return {
      entities: entitiesRes,
      relations: relationsRes,
      statistics: statisticsRes,
      coexistingFactors: coexistingRes,
      summary: summaryRes
    };
  } catch (error) {
    return {
      entities: generateEntities(""),
      relations: generateRelations(),
      statistics: generateStatistics(),
      coexistingFactors: coexistingDatas.map((codata)=>codata.name),
      summary: summary
    };
  }
};

export const generatePdfReport = async (result: QueryResult | ExtractionResult): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

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

// Helper functions
const generateArticles = (query: string): Article[] => {
  return articles ;
};

const generateEntities = (query: string): any[] => {
  return entities;
};

const generateRelations = (): any[] => {
  return relations;
};

const generateStatistics = (): any[] => {
  return statistics ;
};

const generateSummary = (query: string): string => {
  return summary;
};

const generateQuestions = (query: string): any[] => {
  return qa;
};