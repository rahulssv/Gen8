
export interface ApiConfig {
  apiKey: string;
}

export interface Article {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  url: string;
  abstract: string;
  source: 'PubMed' | 'Taylor & Francis' | 'Science Direct' | 'Other';
  relevanceScore?: number;
}

export interface Entity {
  name: string;
  type: 'biomarker' | 'mutation' | 'drug' | 'disease' | 'clinical trial' | 'other';
  mentions: number;
  relations: Relation[];
}

export interface Relation {
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
}

export interface StatisticalData {
  type: 'survival rate' | 'efficacy' | 'p-value' | 'hazard ratio' | 'other';
  value: string | number;
  unit?: string;
  context: string;
}

export interface QueryResult {
  query: string;
  articles: Article[];
  entities: Entity[];
  statistics: StatisticalData[];
  summary: string;
  aiGeneratedQuestions: AIQuestion[];
}

export interface AIQuestion {
  question: string;
  answer: string;
}

export interface ExtractionResult {
  entities: Entity[];
  relations: Relation[];
  statistics: StatisticalData[];
  coexistingFactors: string[];
  summary: string;
}

export interface ChartData {
  type: 'bar' | 'pie' | 'line';
  title: string;
  data: any; // Will be formatted according to recharts requirements
}

export interface Drug {
  name: string;
  type: string;
  mechanism: string;
  efficacy: string;
  approvalStatus: string;
  url?: string;
}

export interface ClinicalTrial {
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

export interface DiseaseAssociation {
  disease: string;
  relationship: string;
  strength: 'Strong' | 'Moderate' | 'Weak';
  evidence: string;
  notes?: string;
}

export interface CoexistingBiomarker {
  name: string;
  type: string;
  effect: 'Synergistic' | 'Antagonistic' | 'No effect' | 'Variable';
  clinicalImplication: string;
  frequencyOfCooccurrence?: string;
}

export interface BiomarkerInfo {
  name: string;
  aliases: string[];
  type: string;
  description: string;
  clinicalSignificance: string[];
  normalRange?: {
    value: string;
    unit: string;
  };
  associatedDiseases: string[];
  testMethods: string[];
  references: string[];
}

export interface Biomarker{
  id: string,
  name: string,
  value: number,
  unit: string,
  normal_range: {
    min: number,
    max: number
  },
  description: string
}