
import { Article, QueryResult, ExtractionResult } from './types';

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
  
  return [
    {
      id: "1",
      title: isBraf ? "Encorafenib, Binimetinib, and Cetuximab in BRAF V600E–Mutated Colorectal Cancer" : "Novel treatment approaches in metastatic cancer",
      authors: ["Kopetz S", "Grothey A", "Yaeger R"],
      journal: "New England Journal of Medicine",
      year: 2023,
      url: "https://pubmed.ncbi.nlm.nih.gov/article1",
      abstract: "The BRAF V600E mutation occurs in 8 to 12% of patients with metastatic colorectal cancer and is associated with poor prognosis...",
      source: "PubMed",
      relevanceScore: 0.92
    },
    {
      id: "2",
      title: isBraf ? "Efficacy of Combined BRAF and MEK Inhibition in BRAF V600E-Mutant Colorectal Cancer" : "Targeted therapy advancements in solid tumors",
      authors: ["Van Cutsem E", "Huijberts S", "Grothey A"],
      journal: "Journal of Clinical Oncology",
      year: 2022,
      url: "https://pubmed.ncbi.nlm.nih.gov/article2",
      abstract: "BRAF V600E-mutated metastatic colorectal cancer has a poor prognosis with limited treatment options...",
      source: "Taylor & Francis",
      relevanceScore: 0.89
    },
    {
      id: "3",
      title: "Molecular Profiling and Targeted Therapy in BRAF-Mutant Colorectal Cancer",
      authors: ["Parseghian CM", "Napolitano S", "Loree JM"],
      journal: "Clinical Cancer Research",
      year: 2022,
      url: "https://pubmed.ncbi.nlm.nih.gov/article3",
      abstract: "Colorectal cancer (CRC) with BRAF V600E mutation represents a distinct molecular subtype with poor prognosis...",
      source: "Science Direct",
      relevanceScore: 0.87
    },
    {
      id: "4",
      title: "BEACON CRC Study: A Phase 3 Trial of Encorafenib and Cetuximab With or Without Binimetinib",
      authors: ["Kopetz S", "Grothey A", "Van Cutsem E"],
      journal: "Lancet Oncology",
      year: 2021,
      url: "https://pubmed.ncbi.nlm.nih.gov/article4",
      abstract: "The triplet combination of encorafenib, binimetinib, and cetuximab showed promising efficacy in patients with BRAF V600E-mutated metastatic colorectal cancer...",
      source: "PubMed",
      relevanceScore: 0.85
    },
    {
      id: "5",
      title: "Clinical Outcome of Patients with BRAF V600E Mutation in Colorectal Cancer",
      authors: ["Loupakis F", "Cremolini C", "Masi G"],
      journal: "British Journal of Cancer",
      year: 2022,
      url: "https://pubmed.ncbi.nlm.nih.gov/article5",
      abstract: "BRAF V600E mutation is associated with distinctive clinicopathological features and poor prognosis in metastatic colorectal cancer...",
      source: "Science Direct",
      relevanceScore: 0.82
    }
  ];
};

const generateMockEntities = (query: string): any[] => {
  return [
    {
      name: "BRAF V600E",
      type: "mutation",
      mentions: 42,
      relations: [
        {
          subject: "BRAF V600E",
          predicate: "is treated by",
          object: "encorafenib + cetuximab",
          confidence: 0.92
        }
      ]
    },
    {
      name: "encorafenib",
      type: "drug",
      mentions: 38,
      relations: [
        {
          subject: "encorafenib",
          predicate: "combined with",
          object: "cetuximab",
          confidence: 0.95
        }
      ]
    },
    {
      name: "cetuximab",
      type: "drug",
      mentions: 36,
      relations: [
        {
          subject: "cetuximab",
          predicate: "targets",
          object: "EGFR",
          confidence: 0.89
        }
      ]
    },
    {
      name: "colorectal cancer",
      type: "disease",
      mentions: 53,
      relations: [
        {
          subject: "colorectal cancer",
          predicate: "has mutation",
          object: "BRAF V600E",
          confidence: 0.97
        }
      ]
    },
    {
      name: "BEACON CRC",
      type: "clinical trial",
      mentions: 22,
      relations: [
        {
          subject: "BEACON CRC",
          predicate: "evaluated",
          object: "encorafenib + cetuximab",
          confidence: 0.94
        }
      ]
    }
  ];
};

const generateMockRelations = (): any[] => {
  return [
    {
      subject: "BRAF V600E",
      predicate: "is treated by",
      object: "encorafenib + cetuximab",
      confidence: 0.92
    },
    {
      subject: "encorafenib + cetuximab",
      predicate: "improves",
      object: "overall survival",
      confidence: 0.88
    },
    {
      subject: "KRAS mutation",
      predicate: "reduces efficacy of",
      object: "BRAF inhibitors",
      confidence: 0.84
    },
    {
      subject: "binimetinib",
      predicate: "inhibits",
      object: "MEK",
      confidence: 0.95
    }
  ];
};

const generateMockStatistics = (): any[] => {
  return [
    {
      type: "survival rate",
      value: 15,
      unit: "months",
      context: "Median overall survival with encorafenib + cetuximab"
    },
    {
      type: "survival rate",
      value: 10,
      unit: "months",
      context: "Median overall survival with standard therapy"
    },
    {
      type: "efficacy",
      value: 26.8,
      unit: "%",
      context: "Objective response rate with encorafenib + cetuximab"
    },
    {
      type: "p-value",
      value: 0.0003,
      context: "Statistical significance of survival difference"
    },
    {
      type: "hazard ratio",
      value: 0.61,
      context: "Hazard ratio for death with encorafenib + cetuximab vs standard therapy"
    }
  ];
};

const generateMockSummary = (query: string): string => {
  if (query.toLowerCase().includes('braf') && query.toLowerCase().includes('colorectal')) {
    return `Based on analysis of recent clinical research, the combination of encorafenib and cetuximab shows the most promising results for treating BRAF V600E-mutated colorectal cancer, with a median overall survival of 15 months compared to 10 months with standard therapy (HR 0.61, p=0.0003). This combination demonstrated an objective response rate of 26.8%. The addition of binimetinib (MEK inhibitor) to this combination showed marginal additional benefit in the BEACON CRC trial. Treatment efficacy is reduced when KRAS mutations coexist. Current evidence supports encorafenib plus cetuximab as the preferred treatment approach, though ongoing trials are exploring additional combinations with immunotherapy for potentially improved outcomes.`;
  }
  
  return `Based on analysis of the selected articles, the most effective treatment approach involves targeted therapy specific to the molecular profile of the disease. Multiple clinical trials have demonstrated improved outcomes with combination therapies that address specific pathways. Statistical analysis shows significant improvements in survival metrics compared to standard approaches. The research highlights the importance of comprehensive molecular testing to guide treatment decisions and optimize patient outcomes.`;
};

const generateMockQuestions = (query: string): any[] => {
  return [
    {
      question: "Why is the BRAF V600E mutation associated with poor prognosis in colorectal cancer?",
      answer: "BRAF V600E mutation leads to constitutive activation of the MAPK pathway, promoting aggressive tumor behavior, reduced response to standard therapies, and is often associated with microsatellite instability and right-sided tumors, all contributing to poor prognosis."
    },
    {
      question: "What is the mechanism of action for encorafenib in treating BRAF V600E-mutated colorectal cancer?",
      answer: "Encorafenib is a selective BRAF inhibitor that specifically targets the mutated BRAF V600E protein, blocking its ability to activate the MAPK pathway and subsequently inhibiting cancer cell proliferation and survival."
    },
    {
      question: "Why is cetuximab combined with BRAF inhibitors in treatment regimens?",
      answer: "Cetuximab, an EGFR inhibitor, is combined with BRAF inhibitors to prevent feedback reactivation of the MAPK pathway through EGFR signaling, which occurs when BRAF is inhibited alone in colorectal cancer."
    },
    {
      question: "How does the presence of KRAS mutations affect BRAF-targeted therapy?",
      answer: "KRAS mutations can cause resistance to BRAF-targeted therapies as they activate the MAPK pathway downstream of BRAF, bypassing the inhibitory effect of BRAF inhibitors and reducing treatment efficacy."
    }
  ];
};
