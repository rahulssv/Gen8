
// import { Article, QueryResult, ExtractionResult } from './types';
// import qa from '../../../backend/json/AIQuestion.json'
// import statistics from '../../../backend/json/StatisticalData.json'
// import articles from '../../../backend/json/Article.json'
// import entities from '../../../backend/json/Entity.json'
// import relations from '../../../backend/json/Relation.json'
// import summary from '../../../backend/json/Summary.json'
// import coexistingDatas from '../../../backend/json/CoexistingBiomarker.json'
//  API key storage - in a real app, this would be handled more securely
let storedApiKey: string | null = null;

export const setApiKey = (key: string): void => {
  storedApiKey = key;
  localStorage.setItem('insightmed_api_key', key);
};

export const getApiKey = (): string | null => {
  if (storedApiKey) return storedApiKey;
  return localStorage.getItem('insightmed_api_key');
};

// //  API calls - these would be replaced with actual API calls
// export const searchArticles = async (query: string): Promise<QueryResult> => {
//   // In a real implementation, this would make a call to the Gemini API
//   // using the stored API key
  
//   // For now, we'll simulate a delay and return  data
//   await new Promise(resolve => setTimeout(resolve, 2000));

//   //  data
//   return {
//     query,
//     articles: generateArticles(query),
//     entities: generateEntities(query),
//     statistics: generateStatistics(),
//     summary: generateSummary(query),
//     aiGeneratedQuestions: generateQuestions(query)
//   };
// };

// export const analyzeSingleArticle = async (articleUrl: string): Promise<ExtractionResult> => {
//   // In a real implementation, this would analyze a single article
//   await new Promise(resolve => setTimeout(resolve, 1500));
  
//   return {
//     entities: generateEntities(""),
//     relations: generateRelations(),
//     statistics: generateStatistics(),
//     coexistingFactors: coexistingDatas.map((codata)=>codata.name),
//     summary: summary
//   };
// };

// export const generatePdfReport = async (result: QueryResult | ExtractionResult): Promise<string> => {
//   // In a real implementation, this would generate a PDF
//   await new Promise(resolve => setTimeout(resolve, 1000));
  
//   // This would return a URL to the generated PDF
//   return "https://example.com/report.pdf";
// };

// //  data generation helpers
// const generateArticles = (query: string): Article[] => {
//   const isCancer = query.toLowerCase().includes('cancer');
//   const isBraf = query.toLowerCase().includes('braf');
  
//   return articles ;
// };

// const generateEntities = (query: string): any[] => {
//   return entities;
// };

// const generateRelations = (): any[] => {
//   return relations;
// };

// const generateStatistics = (): any[] => {
//   return statistics ;
// };

// const generateSummary = (query: string): string => {
//   // if (query.toLowerCase().includes('braf') && query.toLowerCase().includes('colorectal')) {
//   //   return `Based on analysis of recent clinical research, the combination of encorafenib and cetuximab shows the most promising results for treating BRAF V600E-mutated colorectal cancer, with a median overall survival of 15 months compared to 10 months with standard therapy (HR 0.61, p=0.0003). This combination demonstrated an objective response rate of 26.8%. The addition of binimetinib (MEK inhibitor) to this combination showed marginal additional benefit in the BEACON CRC trial. Treatment efficacy is reduced when KRAS mutations coexist. Current evidence supports encorafenib plus cetuximab as the preferred treatment approach, though ongoing trials are exploring additional combinations with immunotherapy for potentially improved outcomes.`;
//   // }
  
//   return summary;
// };

// const generateQuestions = (query: string): any[] => {
//   return qa;
// };
// import { Article, QueryResult, ExtractionResult, StatisticalData } from './types';
// import { HttpClient } from './httpClient';

// const httpClient = new HttpClient();

// // API service functions
// export const searchArticles = async (query: string): Promise<QueryResult> => {
//   // For now, we'll simulate a delay and return  data
//   await new Promise(resolve => setTimeout(resolve, 2000));
//   const [articles, entities, statistics, summary, aiGeneratedQuestions] = await Promise.all([
//     httpClient.request<Article[]>('/articles', { queryParams: { query } }),
//     httpClient.request<any[]>('/entities', { queryParams: { query } }),
//     httpClient.request<any[]>('/statistics', { queryParams: {} }),
//     httpClient.request<string>('/summary', { queryParams: { query } }),
//     httpClient.request<any[]>('/getqna', { queryParams: { query } })
//   ]);

//   return {
//     query,
//     articles,
//     entities,
//     statistics,
//     summary,
//     aiGeneratedQuestions
//   };
// };

// export const analyzeSingleArticle = async (articleUrl: string): Promise<ExtractionResult> => {
//   const [entities, relations, statistics, coexistingFactors, summary] = await Promise.all([
//     httpClient.request<any[]>('/entities', { queryParams: { url: articleUrl } }),
//     httpClient.request<any[]>('/relations', { queryParams: { url: articleUrl } }),
//     httpClient.request<any[]>('/statistics', { queryParams: { url: articleUrl } }),
//     httpClient.request<string[]>('/co_biomarkers', { queryParams: { url: articleUrl } }),
//     httpClient.request<string>('/summary', { queryParams: { url: articleUrl } })
//   ]);

//   return {
//     entities,
//     relations,
//     statistics,
//     coexistingFactors,
//     summary
//   };
// };

// export const generatePdfReport = async (result: QueryResult | ExtractionResult): Promise<string> => {
//   // In a real implementation, this would generate a PDF
//   await new Promise(resolve => setTimeout(resolve, 1000));
//   // const endpoint = 'articles' in result ? '/query-report' : '/extraction-report';
//   // const response = await httpClient.request<{ reportUrl: string }>(endpoint, {
//   //   method: 'POST',
//   //   body: result
//   // });
//   // return response.reportUrl;
//   return "https://example.com/report.pdf";
// };
import { Article, QueryResult, ExtractionResult, StatisticalData } from './types';
import { HttpClient } from './httpClient';

const httpClient = new HttpClient();

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
//  data generation helpers
const generateArticles = (query: string): Article[] => {
  const isCancer = query.toLowerCase().includes('cancer');
  const isBraf = query.toLowerCase().includes('braf');
  
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
  // if (query.toLowerCase().includes('braf') && query.toLowerCase().includes('colorectal')) {
  //   return `Based on analysis of recent clinical research, the combination of encorafenib and cetuximab shows the most promising results for treating BRAF V600E-mutated colorectal cancer, with a median overall survival of 15 months compared to 10 months with standard therapy (HR 0.61, p=0.0003). This combination demonstrated an objective response rate of 26.8%. The addition of binimetinib (MEK inhibitor) to this combination showed marginal additional benefit in the BEACON CRC trial. Treatment efficacy is reduced when KRAS mutations coexist. Current evidence supports encorafenib plus cetuximab as the preferred treatment approach, though ongoing trials are exploring additional combinations with immunotherapy for potentially improved outcomes.`;
  // }
  
  return summary;
};

const generateQuestions = (query: string): any[] => {
  return qa;
};