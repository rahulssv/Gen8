
import { BiomarkerValue } from '@/utils/diagnosticUtils';

// Define the response structure from Gemini API
export interface GeminiDiagnosticResponse {
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
  sources: string[]; // Research paper sources
}

class AIDiagnosticService {
  private apiKey: string | null = null;
  
  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
  }
  
  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('gemini_api_key');
    }
    return this.apiKey;
  }
  
  async analyzeBiomarkers(biomarkerValues: BiomarkerValue[]): Promise<GeminiDiagnosticResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error("Gemini API key not set. Please set an API key to continue.");
    }
    
    try {
      // Format biomarker data for the prompt
      const biomarkerData = biomarkerValues.map(bm => {
        return `${bm.id}: ${bm.value}`;
      }).join(', ');
      
      // Construct prompt for Gemini API
      const prompt = `
As a breast cancer diagnostic AI, analyze these biomarker values and provide a detailed diagnostic assessment based on the latest research papers:

${biomarkerData}

1. Include citations to specific research papers that your assessment is based on, and provide the URL for each paper.
2. Determine the likely cancer subtype (Luminal A, Luminal B, HER2-Positive, or Triple-Negative).
3. Provide an assessment of the patient's condition based ONLY on validated research findings.
4. List specific recommendations based on current clinical guidelines.
5. For each biomarker, determine if the value is normal, elevated, high, or critical and explain its significance.
6. DO NOT attempt to definitively diagnose cancer stage unless the biomarker pattern conclusively indicates it according to published research.

Format your response as a structured JSON object with the following properties:
{
  "stage": "string (or 'Requires further clinical assessment' if uncertain)",
  "subtype": "string",
  "riskLevel": "low/moderate/high/very high",
  "recommendations": ["array of strings"],
  "detailedAnalysis": "string",
  "biomarkerAnalysis": [
    {"id": "string", "name": "string", "value": number, "status": "normal/elevated/high/critical", "significance": "string"}
  ],
  "sources": [
    {"title": "string", "url": "string"}
  ]
}
`;

      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096,
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API Error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      // Extract the text response from Gemini
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;
      
      if (!generatedText) {
        throw new Error("Empty response from Gemini API");
      }
      
      // Extract JSON from the response
      let jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                      generatedText.match(/{[\s\S]*?}/);
                      
      let diagnosticData: GeminiDiagnosticResponse;
      
      if (jsonMatch) {
        try {
          // Parse the JSON response
          diagnosticData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          
          // Validate and ensure proper structure
          if (!diagnosticData.stage) diagnosticData.stage = "Requires further clinical assessment";
          if (!diagnosticData.sources || !Array.isArray(diagnosticData.sources)) {
            diagnosticData.sources = ["No specific research papers cited"];
          }
          
          // Ensure biomarkerAnalysis exists and has proper structure
          if (!diagnosticData.biomarkerAnalysis || !Array.isArray(diagnosticData.biomarkerAnalysis)) {
            diagnosticData.biomarkerAnalysis = biomarkerValues.map(bm => ({
              id: bm.id,
              name: bm.id,
              value: bm.value,
              status: "normal" as "normal" | "elevated" | "high" | "critical",
              significance: "No specific significance provided by AI"
            }));
          }
          
          return diagnosticData;
        } catch (error) {
          console.error("Error parsing Gemini response JSON:", error);
          throw new Error("Failed to parse diagnostic data from AI response");
        }
      } else {
        // If we can't extract JSON, create a fallback response
        console.error("Could not extract JSON from Gemini response");
        throw new Error("Invalid response format from Gemini API");
      }
    } catch (error) {
      console.error("Error in AI diagnostic service:", error);
      throw error;
    }
  }
}

export const aiDiagnosticService = new AIDiagnosticService();
