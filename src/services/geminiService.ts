
/**
 * Service for Gemini API integration
 */

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
}

export const fetchGeminiResults = async (
  query: string,
  apiKey: string
): Promise<string> => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
                  You are a specialized medical research assistant. Provide a detailed, evidence-based response to the following biomedical query:
                  
                  Query: ${query}
                  
                  Format your response to include ALL of the following clearly labeled sections:
                  
                  1. SUMMARY: A brief explanation focused on the query (1-2 paragraphs)
                  
                  2. KEY FINDINGS:
                     - Specific details about biomarkers and mutations mentioned in the query
                     - Associated drugs and treatments with efficacy rates
                     - Relevant clinical trials with outcomes
                     - Disease associations and mechanisms
                     - Coexisting biomarkers/mutations and their combined effects
                     - Statistical data (survival rates, response rates, etc.)
                  
                  3. REFERENCES: Include at least 3-5 specific reference citations with PMID numbers (if available) or DOI links in this format:
                     [1] Author et al. (Year). Title. Journal. PMID: number or https://doi.org/link
                  
                  Your response must be factual, evidence-based, and include specific statistical data where available.
                  Keep your full response to 3-5 paragraphs for readability.
                  `,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to fetch from Gemini API"
      );
    }

    const data = (await response.json()) as GeminiResponse;
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    throw error;
  }
};
