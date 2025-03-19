
import { useState } from 'react';
import { formatResponseWithLinks } from '@/utils/formatUtils';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  SlidersHorizontal, 
  FileText, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface GeminiResultsDisplayProps {
  geminiResponse: string | null;
  isLoading: boolean;
  query: string;
}

const GeminiResultsDisplay = ({ geminiResponse, isLoading, query }: GeminiResultsDisplayProps) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="mb-6 p-6 bg-white border rounded-lg shadow-subtle">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-bioquery-200 border-t-bioquery-600 rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Analyzing biomedical data with Gemini...</p>
        </div>
      </div>
    );
  }

  if (!geminiResponse) return null;

  // Parse the different sections from the response
  const summaryMatch = geminiResponse.match(/\*\*SUMMARY\*\*:?([\s\S]*?)(?=\*\*KEY FINDINGS\*\*|\*\*REFERENCES\*\*|$)/i);
  const keyFindingsMatch = geminiResponse.match(/\*\*KEY FINDINGS\*\*:?([\s\S]*?)(?=\*\*REFERENCES\*\*|$)/i);
  const referencesMatch = geminiResponse.match(/\*\*REFERENCES\*\*:?([\s\S]*?)$/i);

  const summary = summaryMatch ? summaryMatch[1].trim() : '';
  const keyFindings = keyFindingsMatch ? keyFindingsMatch[1].trim() : '';
  const references = referencesMatch ? referencesMatch[1].trim() : '';

  // Parse the key findings subsections
  const biomarkersMatch = keyFindings.match(/\*\*Biomarkers and Mutations\*\*:?([\s\S]*?)(?=\*\*Drugs and Treatments\*\*|\*\*Clinical Trials\*\*|\*\*Disease Associations\*\*|\*\*Coexisting Biomarkers\/Mutations\*\*|\*\*Statistical Data\*\*|$)/i);
  const drugsMatch = keyFindings.match(/\*\*Drugs and Treatments\*\*:?([\s\S]*?)(?=\*\*Clinical Trials\*\*|\*\*Disease Associations\*\*|\*\*Coexisting Biomarkers\/Mutations\*\*|\*\*Statistical Data\*\*|$)/i);
  const trialsMatch = keyFindings.match(/\*\*Clinical Trials\*\*:?([\s\S]*?)(?=\*\*Disease Associations\*\*|\*\*Coexisting Biomarkers\/Mutations\*\*|\*\*Statistical Data\*\*|$)/i);
  const diseaseMatch = keyFindings.match(/\*\*Disease Associations\*\*:?([\s\S]*?)(?=\*\*Coexisting Biomarkers\/Mutations\*\*|\*\*Statistical Data\*\*|$)/i);
  const coexistingMatch = keyFindings.match(/\*\*Coexisting Biomarkers\/Mutations\*\*:?([\s\S]*?)(?=\*\*Statistical Data\*\*|$)/i);
  const statisticalMatch = keyFindings.match(/\*\*Statistical Data\*\*:?([\s\S]*?)$/i);

  const biomarkers = biomarkersMatch ? biomarkersMatch[1].trim() : '';
  const drugs = drugsMatch ? drugsMatch[1].trim() : '';
  const trials = trialsMatch ? trialsMatch[1].trim() : '';
  const diseases = diseaseMatch ? diseaseMatch[1].trim() : '';
  const coexisting = coexistingMatch ? coexistingMatch[1].trim() : '';
  const statistical = statisticalMatch ? statisticalMatch[1].trim() : '';

  // Extract biomarkers as separate items
  const extractBiomarkers = (text: string) => {
    const items = text.split(/\n-\s+/).filter(item => item.trim() !== '');
    return items.map(item => item.trim());
  };

  const biomarkerItems = extractBiomarkers(biomarkers);

  // Extract references as separate items
  const extractReferences = (text: string) => {
    return text.split(/\[\d+\]/).filter(item => item.trim() !== '')
      .map(item => item.trim());
  };

  const referenceItems = extractReferences(references);

  const navigateToDetailPage = (entity: string, type: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('query', `${entity} ${type}`);
    searchParams.set('context', query);
    navigate(`/detail?${searchParams.toString()}`);
  };

  return (
    <div className="mb-6 p-6 bg-white border rounded-lg shadow-subtle">
      <h3 className="text-lg font-medium mb-3">Biomedical Analysis</h3>
      
      {/* Summary Section */}
      <div className="prose prose-slate max-w-none mb-6">
        <h4 className="text-bioquery-700 font-medium mb-3">SUMMARY</h4>
        <div 
          dangerouslySetInnerHTML={{ __html: formatResponseWithLinks(summary) }}
          className="mb-4 leading-relaxed text-foreground/90"
        />
      </div>

      {/* Key Findings Section with Accordion */}
      <div className="mb-6">
        <h4 className="text-bioquery-700 font-medium mb-3">KEY FINDINGS</h4>
        
        <Accordion type="single" collapsible className="w-full">
          {/* Biomarkers and Mutations */}
          <AccordionItem value="biomarkers" className="border-b">
            <AccordionTrigger className="text-bioquery-600 font-medium">
              Biomarkers and Mutations
            </AccordionTrigger>
            <AccordionContent>
              <div className="mb-4">
                <div 
                  dangerouslySetInnerHTML={{ __html: formatResponseWithLinks(biomarkers) }}
                  className="leading-relaxed text-foreground/90 mb-4"
                />
                
                {biomarkerItems.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => {}}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Diagnostic tool
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => {}}
                    >
                      <FileText className="h-4 w-4" />
                      Biomarker references
                    </Button>
                  </div>
                )}
                
                {biomarkerItems.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {biomarkerItems.map((biomarker, idx) => {
                      // Extract just the biomarker name
                      const biomarkerName = biomarker.split(':')[0]?.trim() || biomarker;
                      
                      return (
                        <Card 
                          key={idx} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigateToDetailPage(biomarkerName, 'biomarker')}
                        >
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium">{biomarkerName}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-xs text-muted-foreground">
                              Click to view detailed analysis
                            </p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Drugs and Treatments */}
          <AccordionItem value="drugs" className="border-b">
            <AccordionTrigger className="text-bioquery-600 font-medium">
              Drugs and Treatments
            </AccordionTrigger>
            <AccordionContent>
              <div 
                dangerouslySetInnerHTML={{ __html: formatResponseWithLinks(drugs) }}
                className="leading-relaxed text-foreground/90"
              />
            </AccordionContent>
          </AccordionItem>
          
          {/* Clinical Trials */}
          <AccordionItem value="trials" className="border-b">
            <AccordionTrigger className="text-bioquery-600 font-medium">
              Clinical Trials
            </AccordionTrigger>
            <AccordionContent>
              <div 
                dangerouslySetInnerHTML={{ __html: formatResponseWithLinks(trials) }}
                className="leading-relaxed text-foreground/90"
              />
            </AccordionContent>
          </AccordionItem>
          
          {/* Disease Associations */}
          <AccordionItem value="diseases" className="border-b">
            <AccordionTrigger className="text-bioquery-600 font-medium">
              Disease Associations
            </AccordionTrigger>
            <AccordionContent>
              <div 
                dangerouslySetInnerHTML={{ __html: formatResponseWithLinks(diseases) }}
                className="leading-relaxed text-foreground/90"
              />
            </AccordionContent>
          </AccordionItem>
          
          {/* Coexisting Biomarkers/Mutations */}
          <AccordionItem value="coexisting" className="border-b">
            <AccordionTrigger className="text-bioquery-600 font-medium">
              Coexisting Biomarkers/Mutations
            </AccordionTrigger>
            <AccordionContent>
              <div 
                dangerouslySetInnerHTML={{ __html: formatResponseWithLinks(coexisting) }}
                className="leading-relaxed text-foreground/90"
              />
            </AccordionContent>
          </AccordionItem>
          
          {/* Statistical Data */}
          <AccordionItem value="statistical" className="border-b">
            <AccordionTrigger className="text-bioquery-600 font-medium">
              Statistical Data
            </AccordionTrigger>
            <AccordionContent>
              <div 
                dangerouslySetInnerHTML={{ __html: formatResponseWithLinks(statistical) }}
                className="leading-relaxed text-foreground/90"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* References Section */}
      <div>
        <h4 className="text-bioquery-700 font-medium mb-3">REFERENCES</h4>
        
        <div className="grid grid-cols-1 gap-3">
          {referenceItems.map((reference, idx) => {
            // Try to extract title and authors
            const titleMatch = reference.match(/"([^"]+)"/);
            const authorsMatch = reference.match(/([A-Za-z\s]+et al\.)/);
            const yearMatch = reference.match(/\((\d{4})\)/);
            const journalMatch = reference.match(/\*([^*]+)\*/);
            const pmidMatch = reference.match(/PMID:\s*(\d+)/);
            const doiMatch = reference.match(/(https?:\/\/doi\.org\/[^\s]+)/);
            
            const title = titleMatch ? titleMatch[1] : `Reference ${idx + 1}`;
            const authors = authorsMatch ? authorsMatch[1] : '';
            const year = yearMatch ? yearMatch[1] : '';
            const journal = journalMatch ? journalMatch[1] : '';
            const pmid = pmidMatch ? pmidMatch[1] : '';
            const doi = doiMatch ? doiMatch[1] : '';
            
            const url = pmid 
              ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` 
              : doi ? doi : '';
            
            return (
              <Card 
                key={idx} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigateToDetailPage(title, 'reference')}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground">
                    {authors} ({year}) • {journal}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-bioquery-600">
                      Click for AI insights
                    </p>
                    
                    {url && (
                      <a 
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center text-bioquery-600 hover:text-bioquery-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Source <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GeminiResultsDisplay;
