
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SearchForm from '@/components/SearchForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import Footer from '@/components/Footer';
import { fetchGeminiResults } from '@/services/geminiService';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleSearch = async (query: string, apiKey: string) => {
    setSearchQuery(query);
    setGeminiLoading(true);
    setGeminiResponse(null);
    
    try {
      // Setup prompt using the detailed format specified in the requirements
      const detailedPrompt = `You are a specialized medical research assistant with access to PubMed. Your task is to provide a detailed, evidence-based response to the following biomedical query:

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
      [3] Smith J et al. (2021). "Impact of coexisting mutations in colorectal cancer." *J Clin Oncol*. PMID: 33456789.`;
      
      const response = await fetchGeminiResults(detailedPrompt, apiKey);
      setGeminiResponse(response);
      setHasSearched(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error fetching from Gemini:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get results from Gemini API",
        variant: "destructive",
      });
    } finally {
      setGeminiLoading(false);
    }
  };
  
  const handleBackToSearch = () => {
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {!hasSearched ? (
          <>
            <Hero />
            <SearchForm onSearch={handleSearch} />
            
            <section className="py-16 px-6 md:px-10 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FeatureCard 
                    title="Time-Saving" 
                    description="Reduce research time from hours to minutes with our advanced extraction and summarization tools."
                  />
                  <FeatureCard 
                    title="Evidence-Based" 
                    description="Generate comprehensive summaries with statistical data and direct references to source articles."
                  />
                  <FeatureCard 
                    title="Customizable" 
                    description="Tailor your research to specific mutations, biomarkers, drugs, or clinical trials."
                  />
                </div>
              </div>
            </section>
          </>
        ) : (
          <ResultsDisplay 
            query={searchQuery}
            onBack={handleBackToSearch}
            geminiResponse={geminiResponse}
            isLoading={geminiLoading}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border hover:shadow-hover transition-all duration-300">
      <div className="w-12 h-12 rounded-full bg-bioquery-100 flex items-center justify-center mb-4">
        <div className="w-6 h-6 rounded-md bg-bioquery-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
