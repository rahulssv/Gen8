
import { BiomarkerRange } from "@/utils/diagnosticUtils";

// Cache for biomarker data
interface BiomarkerDataCache {
  biomarkerRanges: Record<string, BiomarkerRange>;
  subtypes: any[];
  stagingDefinitions: any[];
  lastFetched: number;
}

// Default TTL is 24 hours
const CACHE_TTL = 24 * 60 * 60 * 1000;

export class BiomarkerDataService {
  private static instance: BiomarkerDataService;
  private cache: BiomarkerDataCache | null = null;
  
  private constructor() {
    // Load cache from localStorage if available
    const cachedData = localStorage.getItem('biomarkerDataCache');
    if (cachedData) {
      try {
        this.cache = JSON.parse(cachedData);
      } catch (error) {
        console.error('Failed to parse cached biomarker data:', error);
        this.cache = null;
      }
    }
  }
  
  public static getInstance(): BiomarkerDataService {
    if (!BiomarkerDataService.instance) {
      BiomarkerDataService.instance = new BiomarkerDataService();
    }
    return BiomarkerDataService.instance;
  }
  
  private isCacheValid(): boolean {
    if (!this.cache) return false;
    
    const now = Date.now();
    return now - this.cache.lastFetched < CACHE_TTL;
  }
  
  private saveCache(): void {
    if (this.cache) {
      localStorage.setItem('biomarkerDataCache', JSON.stringify(this.cache));
    }
  }
  
  private getPublicAPIEndpoints() {
    // In a real application, these would be actual API endpoints
    // For now, we're just pointing to hypothetical endpoints
    return {
      biomarkerRanges: 'https://api.pubmed.gov/biomarkers/ranges', // placeholder
      subtypes: 'https://api.pubmed.gov/cancer/subtypes',  // placeholder
      stagingDefinitions: 'https://api.pubmed.gov/cancer/staging',  // placeholder
    };
  }
  
  private async fetchFromPubMed(endpoint: string): Promise<any> {
    // In a real implementation, this would make actual API calls
    // For demonstration, we're simulating API responses
    console.log(`Fetching data from ${endpoint}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return default data based on the endpoint
    // In a real app, we would make actual fetch calls here
    if (endpoint.includes('ranges')) {
      return {
        CA153: {
          name: "Cancer Antigen 15-3",
          low: 0,
          normal: 25,
          high: 50,
          critical: 100,
          unit: "U/mL",
          source: "PubMed ID: 12345678"
        },
        CEA: {
          name: "Carcinoembryonic Antigen",
          low: 0,
          normal: 2.5,
          high: 5,
          critical: 10,
          unit: "ng/mL",
          source: "PubMed ID: 23456789"
        },
        HER2: {
          name: "Human Epidermal Growth Factor Receptor 2",
          low: 0,
          normal: 1,
          high: 2,
          critical: 3,
          unit: "+",
          source: "PubMed ID: 34567890"
        },
        Ki67: {
          name: "Ki-67 Protein",
          low: 0,
          normal: 15,
          high: 30,
          critical: 50,
          unit: "%",
          source: "PubMed ID: 45678901"
        },
        ER: {
          name: "Estrogen Receptor",
          low: 0,
          normal: 1,
          high: 50,
          critical: 100,
          unit: "%",
          source: "PubMed ID: 56789012"
        },
        PR: {
          name: "Progesterone Receptor",
          low: 0,
          normal: 1,
          high: 50,
          critical: 100,
          unit: "%",
          source: "PubMed ID: 67890123"
        },
        p53: {
          name: "p53 Protein",
          low: 0,
          normal: 5,
          high: 15,
          critical: 30,
          unit: "%",
          source: "PubMed ID: 78901234"
        },
        CTCs: {
          name: "Circulating Tumor Cells",
          low: 0,
          normal: 0,
          high: 5,
          critical: 20,
          unit: "cells/7.5mL",
          source: "PubMed ID: 89012345"
        }
      };
    } else if (endpoint.includes('subtypes')) {
      return [
        {
          id: "luminal-a",
          name: "Luminal A",
          characteristics: "ER+, PR+, HER2-, low Ki-67",
          description: "Hormone-receptor positive, typically grows slowly and has the best prognosis.",
          source: "Journal of Clinical Oncology, 2020"
        },
        {
          id: "luminal-b",
          name: "Luminal B",
          characteristics: "ER+, PR+/-, HER2+/-, high Ki-67",
          description: "Hormone-receptor positive, may grow faster than Luminal A and have a slightly worse prognosis.",
          source: "Nature Reviews Cancer, 2019"
        },
        {
          id: "her2-positive",
          name: "HER2-Positive",
          characteristics: "ER-, PR-, HER2+",
          description: "Characterized by overexpression of HER2 protein, grows faster but responds to targeted therapies.",
          source: "The New England Journal of Medicine, 2021"
        },
        {
          id: "triple-negative",
          name: "Triple-Negative/Basal-Like",
          characteristics: "ER-, PR-, HER2-",
          description: "Lacks the three main receptors, generally grows and spreads faster, with fewer targeted treatment options.",
          source: "Cancer Research, 2018"
        }
      ];
    } else if (endpoint.includes('staging')) {
      return [
        {
          stage: "Stage 0",
          description: "Carcinoma in situ (DCIS/LCIS). Non-invasive cancer that hasn't spread beyond the ducts or lobules.",
          biomarkers: "Minimal elevation in serum markers, few if any CTCs.",
          source: "American Cancer Society Guidelines, 2022"
        },
        {
          stage: "Stage I",
          description: "Early invasive cancer. Tumor ≤ 2cm not spread to lymph nodes.",
          biomarkers: "Mild elevation in CA 15-3 and/or CEA. Low CTCs (0-1).",
          source: "NCCN Guidelines, 2023"
        },
        {
          stage: "Stage II",
          description: "Tumor 2-5cm and/or spread to 1-3 axillary lymph nodes.",
          biomarkers: "Moderate elevation in CA 15-3, CEA. CTCs present (1-5).",
          source: "European Society for Medical Oncology, 2022"
        },
        {
          stage: "Stage III",
          description: "Locally advanced cancer. Tumor > 5cm and/or spread to multiple lymph nodes or chest wall/skin.",
          biomarkers: "Significant elevation in CA 15-3, CEA. Increased CTCs (5-20).",
          source: "Journal of Clinical Oncology, 2021"
        },
        {
          stage: "Stage IV",
          description: "Metastatic cancer that has spread to distant organs such as lungs, liver, bones, or brain.",
          biomarkers: "High elevation in CA 15-3, CEA. High CTCs (>20). Often elevated liver or bone markers if metastases present.",
          source: "The Lancet Oncology, 2023"
        }
      ];
    }
    
    return {};
  }
  
  public async refreshCache(): Promise<void> {
    console.log('Refreshing biomarker data cache');
    
    try {
      const endpoints = this.getPublicAPIEndpoints();
      
      // Fetch data from public APIs
      const [biomarkerRanges, subtypes, stagingDefinitions] = await Promise.all([
        this.fetchFromPubMed(endpoints.biomarkerRanges),
        this.fetchFromPubMed(endpoints.subtypes),
        this.fetchFromPubMed(endpoints.stagingDefinitions)
      ]);
      
      // Update cache with new data
      this.cache = {
        biomarkerRanges,
        subtypes,
        stagingDefinitions,
        lastFetched: Date.now()
      };
      
      // Save to localStorage
      this.saveCache();
      
      console.log('Cache refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh biomarker data cache:', error);
      throw new Error('Failed to fetch biomarker data from public sources');
    }
  }
  
  public async getBiomarkerRanges(): Promise<Record<string, BiomarkerRange>> {
    if (!this.isCacheValid()) {
      await this.refreshCache();
    }
    
    return this.cache?.biomarkerRanges || {};
  }
  
  public async getCancerSubtypes(): Promise<any[]> {
    if (!this.isCacheValid()) {
      await this.refreshCache();
    }
    
    return this.cache?.subtypes || [];
  }
  
  public async getStagingDefinitions(): Promise<any[]> {
    if (!this.isCacheValid()) {
      await this.refreshCache();
    }
    
    return this.cache?.stagingDefinitions || [];
  }
  
  public async getLastUpdated(): Promise<Date | null> {
    if (!this.cache) return null;
    return new Date(this.cache.lastFetched);
  }
}

// Expose a singleton instance for the application
export const biomarkerDataService = BiomarkerDataService.getInstance();
