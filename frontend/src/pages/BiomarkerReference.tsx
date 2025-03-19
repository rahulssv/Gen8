
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileSearch, Search, Dna } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BiomarkerReference = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<BiomarkerInfo | null>(null);
  
  interface BiomarkerInfo {
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

  // This would typically come from an API
  const biomarkerDatabase: Record<string, BiomarkerInfo> = {
    "braf": {
      name: "BRAF",
      aliases: ["B-Raf proto-oncogene", "v-Raf murine sarcoma viral oncogene homolog B"],
      type: "Gene/Protein",
      description: "BRAF is a gene that encodes a protein called B-Raf, which is involved in sending signals inside cells that direct cell growth. Mutations in this gene can cause cells to grow and divide abnormally, potentially leading to cancer.",
      clinicalSignificance: [
        "Critical driver mutation in several cancer types",
        "Targetable by BRAF inhibitor drugs like vemurafenib, dabrafenib, and encorafenib",
        "Most common mutation is V600E, representing ~90% of all BRAF mutations"
      ],
      associatedDiseases: [
        "Melanoma",
        "Colorectal cancer",
        "Thyroid cancer",
        "Hairy cell leukemia",
        "Langerhans cell histiocytosis"
      ],
      testMethods: [
        "PCR-based methods",
        "Next-generation sequencing (NGS)",
        "Immunohistochemistry for BRAF V600E"
      ],
      references: [
        "Davies H, et al. Mutations of the BRAF gene in human cancer. Nature. 2002;417:949-954.",
        "Flaherty KT, et al. Inhibition of mutated, activated BRAF in metastatic melanoma. N Engl J Med. 2010;363:809-819."
      ]
    },
    "egfr": {
      name: "EGFR",
      aliases: ["Epidermal Growth Factor Receptor", "HER1", "ErbB1"],
      type: "Gene/Protein",
      description: "EGFR is a transmembrane receptor that binds to epidermal growth factor, leading to cellular proliferation, differentiation, and survival. Mutations or overexpression can lead to uncontrolled cell division.",
      clinicalSignificance: [
        "Key driver in non-small cell lung cancer",
        "Targetable by tyrosine kinase inhibitors like erlotinib, gefitinib, and osimertinib",
        "Common mutations include exon 19 deletions and L858R point mutation"
      ],
      associatedDiseases: [
        "Non-small cell lung cancer",
        "Colorectal cancer",
        "Glioblastoma",
        "Head and neck squamous cell carcinoma"
      ],
      testMethods: [
        "PCR-based methods",
        "Next-generation sequencing (NGS)",
        "FISH for gene amplification",
        "Immunohistochemistry for protein expression"
      ],
      references: [
        "Lynch TJ, et al. Activating mutations in the epidermal growth factor receptor underlying responsiveness of non-small-cell lung cancer to gefitinib. N Engl J Med. 2004;350:2129-2139.",
        "Paez JG, et al. EGFR mutations in lung cancer: correlation with clinical response to gefitinib therapy. Science. 2004;304:1497-1500."
      ]
    },
    "psa": {
      name: "PSA",
      aliases: ["Prostate-Specific Antigen", "Kallikrein-3", "KLK3"],
      type: "Protein/Blood Biomarker",
      description: "PSA is a protein produced by the prostate gland. Blood levels of PSA can be elevated in men with prostate cancer, but also in non-cancerous conditions like prostatitis and benign prostatic hyperplasia.",
      clinicalSignificance: [
        "Screening tool for prostate cancer",
        "Monitoring treatment response and recurrence",
        "Higher levels correlate with increased risk of prostate cancer"
      ],
      normalRange: {
        value: "<4.0",
        unit: "ng/mL"
      },
      associatedDiseases: [
        "Prostate cancer",
        "Benign prostatic hyperplasia",
        "Prostatitis"
      ],
      testMethods: [
        "Blood test (ELISA)",
        "Free PSA test",
        "PSA velocity (rate of change over time)"
      ],
      references: [
        "Catalona WJ, et al. Measurement of prostate-specific antigen in serum as a screening test for prostate cancer. N Engl J Med. 1991;324:1156-1161.",
        "Thompson IM, et al. Prevalence of prostate cancer among men with a prostate-specific antigen level ≤4.0 ng per milliliter. N Engl J Med. 2004;350:2239-2246."
      ]
    },
    "tnf-alpha": {
      name: "TNF-α",
      aliases: ["Tumor Necrosis Factor alpha", "TNF", "Cachectin"],
      type: "Cytokine/Protein",
      description: "TNF-α is a cytokine involved in systemic inflammation and acute phase reaction. It is produced primarily by activated macrophages, although it can be produced by other cell types.",
      clinicalSignificance: [
        "Key mediator of inflammatory response",
        "Target for biologic therapies in autoimmune diseases",
        "Elevated in various inflammatory conditions"
      ],
      normalRange: {
        value: "<8.1",
        unit: "pg/mL"
      },
      associatedDiseases: [
        "Rheumatoid arthritis",
        "Inflammatory bowel disease",
        "Psoriasis",
        "Ankylosing spondylitis",
        "Sepsis"
      ],
      testMethods: [
        "ELISA",
        "Radioimmunoassay",
        "Flow cytometry"
      ],
      references: [
        "Feldmann M, et al. TNF alpha as a therapeutic target in rheumatoid arthritis. Circ Res. 2002;90:123-132.",
        "Brennan FM, et al. Inhibitory effect of TNF alpha antibodies on synovial cell interleukin-1 production in rheumatoid arthritis. Lancet. 1989;2:244-247."
      ]
    },
    "hba1c": {
      name: "HbA1c",
      aliases: ["Glycated hemoglobin", "Hemoglobin A1c", "A1C"],
      type: "Blood Biomarker",
      description: "HbA1c is formed when hemoglobin joins with glucose in the blood, becoming 'glycated'. By measuring HbA1c, clinicians can get an overall picture of average blood sugar levels over a period of weeks/months.",
      clinicalSignificance: [
        "Diagnosis of diabetes mellitus",
        "Monitoring long-term glycemic control",
        "Predictor of diabetes complications"
      ],
      normalRange: {
        value: "4.0-5.7",
        unit: "%"
      },
      associatedDiseases: [
        "Diabetes mellitus",
        "Prediabetes",
        "Metabolic syndrome"
      ],
      testMethods: [
        "High-performance liquid chromatography (HPLC)",
        "Immunoassay",
        "Capillary electrophoresis"
      ],
      references: [
        "American Diabetes Association. Diagnosis and classification of diabetes mellitus. Diabetes Care. 2010;33:S62-S69.",
        "Nathan DM, et al. The effect of intensive treatment of diabetes on the development and progression of long-term complications in insulin-dependent diabetes mellitus. N Engl J Med. 1993;329:977-986."
      ]
    }
  };

  const handleSearch = () => {
    if (!query.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a biomarker name to search",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      const normalizedQuery = query.toLowerCase().trim();
      
      // Find the biomarker in our database
      const result = Object.values(biomarkerDatabase).find(biomarker => 
        biomarker.name.toLowerCase() === normalizedQuery ||
        biomarker.aliases.some(alias => alias.toLowerCase().includes(normalizedQuery))
      );
      
      if (result) {
        setSearchResult(result);
        toast({
          title: "Biomarker Found",
          description: `Information for ${result.name} is now available`,
        });
      } else {
        setSearchResult(null);
        toast({
          title: "Biomarker Not Found",
          description: "We couldn't find information on this biomarker. Try another search term.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Biomarker Reference Database
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Search our database for detailed information about biomarkers, genes, and molecular targets.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <Card className="shadow-sm border border-gray-200 dark:border-gray-800">
            <CardHeader className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Badge variant="outline" className="mb-2 bg-insight-50 text-insight-700 border-insight-200">
                Reference Search
              </Badge>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Find Biomarker Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter biomarker name (e.g., BRAF, PSA, HbA1c)"
                    className="w-full"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading}
                  className="bg-insight-500 hover:bg-insight-600 ml-0 sm:ml-2"
                >
                  {isLoading ? (
                    <>Searching...</>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>Try searching for: BRAF, EGFR, PSA, TNF-alpha, HbA1c</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {searchResult && (
          <Card className="shadow-sm border border-gray-200 dark:border-gray-800">
            <CardHeader className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Badge variant="outline" className="mb-2 bg-insight-50 text-insight-700 border-insight-200">
                Biomarker Information
              </Badge>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Dna className="mr-2 h-5 w-5 text-insight-500" />
                  {searchResult.name}
                </CardTitle>
                <Badge className="bg-insight-100 text-insight-800">
                  {searchResult.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Aliases */}
                {searchResult.aliases.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Also Known As</h3>
                    <div className="flex flex-wrap gap-2">
                      {searchResult.aliases.map((alias, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50 text-gray-800">
                          {alias}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-gray-800 dark:text-gray-200">{searchResult.description}</p>
                </div>
                
                {/* Normal Range if available */}
                {searchResult.normalRange && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Normal Range</h3>
                    <Badge className="bg-green-100 text-green-800 px-3 py-1">
                      {searchResult.normalRange.value} {searchResult.normalRange.unit}
                    </Badge>
                  </div>
                )}
                
                {/* Clinical Significance */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Clinical Significance</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-200">
                    {searchResult.clinicalSignificance.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Associated Diseases */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Associated Diseases</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.associatedDiseases.map((disease, index) => (
                      <Badge key={index} className="bg-red-100 text-red-800">
                        {disease}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Test Methods */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Testing Methods</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.testMethods.map((method, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* References */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Key References</h3>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {searchResult.references.map((reference, index) => (
                      <p key={index} className="italic">{reference}</p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BiomarkerReference;
