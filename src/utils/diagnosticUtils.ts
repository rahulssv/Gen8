// Biomarker reference ranges
export interface BiomarkerRange {
  name: string;
  low: number;
  normal: number;
  high: number;
  critical: number;
  unit: string;
  source?: string;
}

// In the updated version, this is just a fallback
// The actual data will be fetched from the biomarkerDataService
export const BIOMARKER_RANGES: Record<string, BiomarkerRange> = {
  CA153: {
    name: "Cancer Antigen 15-3",
    low: 0,
    normal: 25,
    high: 50,
    critical: 100,
    unit: "U/mL"
  },
  CEA: {
    name: "Carcinoembryonic Antigen",
    low: 0,
    normal: 2.5,
    high: 5,
    critical: 10,
    unit: "ng/mL"
  },
  HER2: {
    name: "Human Epidermal Growth Factor Receptor 2",
    low: 0,
    normal: 1,
    high: 2,
    critical: 3,
    unit: "+"
  },
  Ki67: {
    name: "Ki-67 Protein",
    low: 0,
    normal: 15,
    high: 30,
    critical: 50,
    unit: "%"
  },
  ER: {
    name: "Estrogen Receptor",
    low: 0,
    normal: 1,
    high: 50,
    critical: 100,
    unit: "%"
  },
  PR: {
    name: "Progesterone Receptor",
    low: 0,
    normal: 1,
    high: 50,
    critical: 100,
    unit: "%"
  },
  p53: {
    name: "p53 Protein",
    low: 0,
    normal: 5,
    high: 15,
    critical: 30,
    unit: "%"
  },
  CTCs: {
    name: "Circulating Tumor Cells",
    low: 0,
    normal: 0,
    high: 5,
    critical: 20,
    unit: "cells/7.5mL"
  }
};

// Cancer subtypes - will be fetched from the service
export const CANCER_SUBTYPES = [
  {
    id: "luminal-a",
    name: "Luminal A",
    characteristics: "ER+, PR+, HER2-, low Ki-67",
    description: "Hormone-receptor positive, typically grows slowly and has the best prognosis."
  },
  {
    id: "luminal-b",
    name: "Luminal B",
    characteristics: "ER+, PR+/-, HER2+/-, high Ki-67",
    description: "Hormone-receptor positive, may grow faster than Luminal A and have a slightly worse prognosis."
  },
  {
    id: "her2-positive",
    name: "HER2-Positive",
    characteristics: "ER-, PR-, HER2+",
    description: "Characterized by overexpression of HER2 protein, grows faster but responds to targeted therapies."
  },
  {
    id: "triple-negative",
    name: "Triple-Negative/Basal-Like",
    characteristics: "ER-, PR-, HER2-",
    description: "Lacks the three main receptors, generally grows and spreads faster, with fewer targeted treatment options."
  }
];

// Stage definitions - will be fetched from the service
export const STAGING_DEFINITIONS = [
  {
    stage: "Stage 0",
    description: "Carcinoma in situ (DCIS/LCIS). Non-invasive cancer that hasn't spread beyond the ducts or lobules.",
    biomarkers: "Minimal elevation in serum markers, few if any CTCs."
  },
  {
    stage: "Stage I",
    description: "Early invasive cancer. Tumor ≤ 2cm not spread to lymph nodes.",
    biomarkers: "Mild elevation in CA 15-3 and/or CEA. Low CTCs (0-1)."
  },
  {
    stage: "Stage II",
    description: "Tumor 2-5cm and/or spread to 1-3 axillary lymph nodes.",
    biomarkers: "Moderate elevation in CA 15-3, CEA. CTCs present (1-5)."
  },
  {
    stage: "Stage III",
    description: "Locally advanced cancer. Tumor > 5cm and/or spread to multiple lymph nodes or chest wall/skin.",
    biomarkers: "Significant elevation in CA 15-3, CEA. Increased CTCs (5-20)."
  },
  {
    stage: "Stage IV",
    description: "Metastatic cancer that has spread to distant organs such as lungs, liver, bones, or brain.",
    biomarkers: "High elevation in CA 15-3, CEA. High CTCs (>20). Often elevated liver or bone markers if metastases present."
  }
];

// Interfaces for diagnostic data
export interface BiomarkerValue {
  id: string;
  value: number;
}

export interface DiagnosticResult {
  stage: string;
  subtype: string;
  riskLevel: "low" | "moderate" | "high" | "very high";
  recommendations: string[];
  detailedAnalysis: string;
  biomarkerAnalysis: {
    id: string;
    name: string;
    value: number;
    status: "normal" | "elevated" | "high" | "critical";
    significance: string;
  }[];
  sources?: string[];
}

// Analyze biomarker status
export const analyzeBiomarkerStatus = (id: string, value: number, customRanges?: Record<string, BiomarkerRange>): "normal" | "elevated" | "high" | "critical" => {
  // Look up range in standard ranges or custom ranges
  const range = BIOMARKER_RANGES[id] || (customRanges ? customRanges[id] : undefined);
  if (!range) return "normal";
  
  if (value <= range.normal) return "normal";
  if (value <= range.high) return "elevated";
  if (value <= range.critical) return "high";
  return "critical";
};

// Get significance of biomarker value
export const getBiomarkerSignificance = (id: string, status: "normal" | "elevated" | "high" | "critical"): string => {
  // Standard biomarkers have specific significance explanations
  switch (id) {
    case "CA153":
      return status === "normal" 
        ? "Normal levels suggest absence of significant tumor burden." 
        : "Elevated levels correlate with tumor burden and may indicate disease progression or recurrence.";
    case "CEA":
      return status === "normal" 
        ? "Normal levels are expected in healthy individuals." 
        : "Elevated CEA may indicate presence of cancer, particularly with metastatic disease.";
    case "HER2":
      return status === "normal" 
        ? "No HER2 overexpression." 
        : "HER2 overexpression indicates eligibility for HER2-targeted therapies.";
    case "Ki67":
      return status === "normal" 
        ? "Low proliferation index suggests slower-growing tumor." 
        : "High proliferation index indicates more aggressive disease and potentially higher recurrence risk.";
    case "ER":
      return status === "normal" 
        ? "Minimal estrogen receptor expression." 
        : "Positive ER status indicates potential benefit from endocrine therapy.";
    case "PR":
      return status === "normal" 
        ? "Minimal progesterone receptor expression." 
        : "Positive PR status indicates potential benefit from endocrine therapy and generally better prognosis.";
    case "p53":
      return status === "normal" 
        ? "Normal p53 function maintained." 
        : "Mutated p53 indicates loss of tumor suppression and potentially more aggressive disease.";
    case "CTCs":
      return status === "normal" 
        ? "No detectable circulating tumor cells." 
        : "Presence of CTCs correlates with increased risk of metastasis and disease progression.";
    default:
      // Generic significance for custom biomarkers
      return status === "normal" 
        ? "Values within normal range." 
        : `${status === "elevated" ? "Elevated" : status === "high" ? "High" : "Critical"} levels may indicate abnormal activity or disease progression.`;
  }
};

// Calculate diagnostic result based on biomarker values
export const calculateDiagnosticResult = (values: BiomarkerValue[], customRanges?: Record<string, BiomarkerRange>): DiagnosticResult => {
  // Create a map of biomarker values for easy access
  const biomarkerMap: Record<string, number> = {};
  values.forEach(bm => {
    biomarkerMap[bm.id] = bm.value;
  });
  
  // Determine cancer subtype
  let subtype = "";
  if ((biomarkerMap.ER ?? 0) > 1) {
    if ((biomarkerMap.HER2 ?? 0) < 2 && (biomarkerMap.Ki67 ?? 0) < 15) {
      subtype = "Luminal A";
    } else {
      subtype = "Luminal B";
    }
  } else if ((biomarkerMap.HER2 ?? 0) >= 2) {
    subtype = "HER2-Positive";
  } else {
    subtype = "Triple-Negative";
  }
  
  // Determine stage based on biomarker values
  let stage = "";
  let riskLevel: "low" | "moderate" | "high" | "very high" = "low";
  
  const ca153 = biomarkerMap.CA153 ?? 0;
  const cea = biomarkerMap.CEA ?? 0;
  const ctcs = biomarkerMap.CTCs ?? 0;
  
  if (ca153 <= 25 && cea <= 2.5 && ctcs <= 0) {
    stage = "Stage 0-I";
    riskLevel = "low";
  } else if (ca153 <= 50 && cea <= 5 && ctcs <= 5) {
    stage = "Stage II";
    riskLevel = "moderate";
  } else if (ca153 <= 100 && cea <= 10 && ctcs <= 20) {
    stage = "Stage III";
    riskLevel = "high";
  } else {
    stage = "Stage IV";
    riskLevel = "very high";
  }
  
  // Generate recommendations based on subtype and stage
  const recommendations: string[] = [];
  
  if (subtype === "Luminal A" || subtype === "Luminal B") {
    recommendations.push("Consider endocrine therapy based on ER/PR status");
  }
  
  if (subtype === "Luminal B" || subtype === "HER2-Positive") {
    recommendations.push("Evaluate for HER2-targeted therapy");
  }
  
  if (subtype === "Triple-Negative") {
    recommendations.push("Consider chemotherapy as primary systemic treatment");
  }
  
  if (stage === "Stage 0-I") {
    recommendations.push("Consider breast-conserving surgery if appropriate");
    recommendations.push("Evaluate need for adjuvant therapy based on pathology");
  } else if (stage === "Stage II") {
    recommendations.push("Evaluate for neoadjuvant therapy");
    recommendations.push("Consider genetic testing for hereditary cancer syndromes");
  } else if (stage === "Stage III") {
    recommendations.push("Recommend neoadjuvant systemic therapy followed by surgery");
    recommendations.push("Comprehensive imaging to rule out distant metastasis");
  } else {
    recommendations.push("Palliative systemic therapy based on subtype");
    recommendations.push("Consider clinical trial enrollment");
    recommendations.push("Comprehensive metastatic workup");
  }
  
  // Create detailed analysis
  const detailedAnalysis = `
    The biomarker profile indicates ${subtype} breast cancer, likely ${stage}. 
    ${subtype === "Luminal A" ? "This subtype typically has the most favorable prognosis with lower recurrence rates." : ""}
    ${subtype === "Luminal B" ? "This subtype has moderate growth rate and may benefit from both endocrine and chemotherapy." : ""}
    ${subtype === "HER2-Positive" ? "This subtype is traditionally more aggressive but responds well to HER2-targeted therapies." : ""}
    ${subtype === "Triple-Negative" ? "This subtype lacks expression of hormonal receptors and HER2, limiting targeted therapy options." : ""}
    
    ${riskLevel === "low" ? "The overall risk profile is low, suggesting early-stage disease with good prognosis." : ""}
    ${riskLevel === "moderate" ? "The moderate risk profile suggests local disease that may benefit from multimodal treatment." : ""}
    ${riskLevel === "high" ? "The high risk profile indicates locally advanced disease requiring aggressive multimodal therapy." : ""}
    ${riskLevel === "very high" ? "The very high risk profile suggests metastatic disease requiring systemic therapy approach." : ""}
  `;
  
  // Create biomarker analysis
  const biomarkerAnalysis = values.map(bm => {
    const status = analyzeBiomarkerStatus(bm.id, bm.value, customRanges);
    const name = BIOMARKER_RANGES[bm.id]?.name || 
                (customRanges && customRanges[bm.id]?.name) || 
                bm.id;
    
    return {
      id: bm.id,
      name,
      value: bm.value,
      status,
      significance: getBiomarkerSignificance(bm.id, status)
    };
  });
  
  // Add sources information to the result
  const sources: string[] = [];
  
  // Add sources from customRanges if available
  if (customRanges) {
    Object.values(customRanges).forEach(range => {
      if (range.source && !sources.includes(range.source)) {
        sources.push(range.source);
      }
    });
  }
  
  // Add built-in sources
  Object.values(BIOMARKER_RANGES).forEach(range => {
    if (range.source && !sources.includes(range.source)) {
      sources.push(range.source);
    }
  });
  
  return {
    stage,
    subtype,
    riskLevel,
    recommendations: generateRecommendations(subtype, stage),
    detailedAnalysis,
    biomarkerAnalysis,
    sources: sources.length > 0 ? sources : undefined
  };
};

// Helper function to generate recommendations based on subtype and stage
const generateRecommendations = (subtype: string, stage: string): string[] => {
  const recommendations: string[] = [];
  
  if (subtype === "Luminal A" || subtype === "Luminal B") {
    recommendations.push("Consider endocrine therapy based on ER/PR status");
  }
  
  if (subtype === "Luminal B" || subtype === "HER2-Positive") {
    recommendations.push("Evaluate for HER2-targeted therapy");
  }
  
  if (subtype === "Triple-Negative") {
    recommendations.push("Consider chemotherapy as primary systemic treatment");
  }
  
  if (stage === "Stage 0-I") {
    recommendations.push("Consider breast-conserving surgery if appropriate");
    recommendations.push("Evaluate need for adjuvant therapy based on pathology");
  } else if (stage === "Stage II") {
    recommendations.push("Evaluate for neoadjuvant therapy");
    recommendations.push("Consider genetic testing for hereditary cancer syndromes");
  } else if (stage === "Stage III") {
    recommendations.push("Recommend neoadjuvant systemic therapy followed by surgery");
    recommendations.push("Comprehensive imaging to rule out distant metastasis");
  } else {
    recommendations.push("Palliative systemic therapy based on subtype");
    recommendations.push("Consider clinical trial enrollment");
    recommendations.push("Comprehensive metastatic workup");
  }
  
  return recommendations;
};
