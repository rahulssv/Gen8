
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileSearch, Search, Dna } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import biomarkerDatabase from '../../../backend/json/BiomarkerInfo.json';

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
