
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
                  You are a specialized medical research assistant with access to PubMed. Your task is to provide a detailed, evidence-based response to the following biomedical query:

                  Query: ${query}

                  To ensure your response is comprehensive and well-structured, format it to include ALL of the following clearly labeled sections:

                  1. **SUMMARY**: 
                    - Provide a concise explanation (1-2 paragraphs) that directly addresses the query. Focus on synthesizing the most relevant and recent findings from PubMed.
                    - Prioritize high-impact, peer-reviewed studies published within the last 5 years, unless older studies are seminal or highly relevant.

                  2. **KEY FINDINGS**:
                    - Present the following details as bullet points, ensuring each point is supported by evidence from PubMed articles:
                      - **Biomarkers and Mutations**: Specific details about any biomarkers or mutations mentioned in the query.
                      - **Drugs and Treatments**: Associated drugs or treatments, including their efficacy rates (e.g., response rates, survival benefits).
                      - **Clinical Trials**: Relevant clinical trials, including their outcomes (e.g., phase, results, patient cohorts).
                      - **Disease Associations**: Diseases linked to the biomarkers/mutations, including mechanisms of action or pathophysiology.
                      - **Coexisting Biomarkers/Mutations**: Any coexisting biomarkers or mutations and their combined effects on treatment or prognosis.
                      - **Statistical Data**: Key statistical findings (e.g., survival rates, hazard ratios, p-values, confidence intervals). Present these in a clear, understandable format (e.g., "5-year survival rate: 75% [95% CI: 70-80%]").
                    - If any of these elements are not applicable or not found in the literature, state this clearly (e.g., "No data on coexisting mutations was identified").

                  3. **REFERENCES**:
                    - Include at least 3-5 specific reference citations from PubMed.
                    - Each citation should be formatted as follows:
                      [1] Author(s) et al. (Year). "Title." *Journal Name*. PMID: [number] or https://doi.org/[link]
                    - Prioritize the most recent and relevant studies. If a study is older but highly cited or foundational, include it and note its significance.

                  **Additional Instructions**:
                  - Your response must be strictly evidence-based. Avoid speculative or unverified information.
                  - Focus on extracting and summarizing data from peer-reviewed articles available on PubMed.
                  - If the query involves a specific disease, treatment, or biomarker, tailor the search to prioritize articles that directly address that context.
                  - For statistical data, include the most clinically significant metrics and ensure they are presented with appropriate context (e.g., study population, treatment arms).
                  - Keep the entire response concise, ideally within 3-5 paragraphs, while ensuring all key points are covered.
                  - If there are conflicting findings or recent updates, highlight these to provide a balanced view (e.g., "A 2023 study [PMID: 12345678] suggests a new treatment approach, contradicting earlier data [PMID: 87654321]").

                  **Output Example**:
                  Based on recent PubMed articles, the best treatment for BRAF V600E mutation in colorectal cancer is the combination of encorafenib and cetuximab, which has shown a median overall survival of 15.3 months [PMID: 34567890]. This is supported by the BEACON CRC trial, a phase 3 study [PMID: 31234567]. Coexisting KRAS mutations may reduce efficacy, though data is limited [PMID: 33456789].

                  **KEY FINDINGS**:
                  - **Biomarkers and Mutations**: BRAF V600E is a key driver mutation in colorectal cancer.
                  - **Drugs and Treatments**: Encorafenib + cetuximab: median OS of 15.3 months (95% CI: 11.5–19.1) [PMID: 34567890].
                  - **Clinical Trials**: BEACON CRC trial (phase 3): improved survival compared to standard therapy [PMID: 31234567].
                  - **Disease Associations**: BRAF V600E is associated with poorer prognosis in metastatic colorectal cancer.
                  - **Coexisting Biomarkers/Mutations**: Limited data; KRAS co-mutations may affect treatment response [PMID: 33456789].
                  - **Statistical Data**: 5-year survival rate for BRAF V600E patients: 10% without targeted therapy [PMID: 29876543].

                  **REFERENCES**:
                  [1] Kopetz S et al. (2019). "Encorafenib, Binimetinib, and Cetuximab in BRAF V600E–Mutated Colorectal Cancer." *N Engl J Med*. PMID: 31566309.
                  [2] Van Cutsem E et al. (2023). "Updated results from the BEACON CRC trial." *Lancet Oncol*. PMID: 36754321.
                  [3] Smith J et al. (2021). "Impact of coexisting mutations in colorectal cancer." *J Clin Oncol*. PMID: 33456789.
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
