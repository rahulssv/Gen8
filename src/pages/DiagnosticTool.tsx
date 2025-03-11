
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DiagnosticForm from '@/components/DiagnosticForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import { BiomarkerValue, DiagnosticResult, calculateDiagnosticResult } from '@/utils/diagnosticUtils';
import { FileText, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { biomarkerDataService } from '@/services/biomarkerDataService';

const DiagnosticTool = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("input");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Check last update on component mount
  React.useEffect(() => {
    const checkLastUpdate = async () => {
      const date = await biomarkerDataService.getLastUpdated();
      setLastUpdated(date);
    };
    checkLastUpdate();
  }, []);
  
  const handleDiagnosticSubmit = async (values: BiomarkerValue[]) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate API call with setTimeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calculate the diagnostic result
      const result = calculateDiagnosticResult(values);
      setDiagnosticResult(result);
      setActiveTab("results");
      
      toast({
        title: "Analysis complete",
        description: "Biomarker analysis has been processed successfully",
      });
    } catch (error) {
      console.error("Error in diagnostic analysis:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error processing the biomarker data",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const clearResults = () => {
    setDiagnosticResult(null);
    setActiveTab("input");
  };
  
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await biomarkerDataService.refreshCache();
      const date = await biomarkerDataService.getLastUpdated();
      setLastUpdated(date);
      
      toast({
        title: "Data refreshed",
        description: "Biomarker reference data updated from latest research sources",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Refresh failed",
        description: "Failed to update data from research sources",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-4">Breast Cancer Diagnostic Tool</h1>
              <p className="text-secondary-foreground max-w-2xl mx-auto">
                Input biomarker values from blood tests and liquid biopsy results to generate a comprehensive diagnostic assessment.
              </p>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-secondary-foreground">
                <span>
                  Data source: Research papers and clinical guidelines
                </span>
                {lastUpdated && (
                  <span className="text-muted-foreground">
                    (Last updated: {lastUpdated.toLocaleDateString()})
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 ml-2"
                  onClick={refreshData}
                  disabled={isRefreshing}
                >
                  <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                  <span>Refresh Data</span>
                </Button>
              </div>
            </div>
            
            <div className="mb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="input" className="flex items-center">
                    <Activity size={16} className="mr-2" />
                    Biomarker Input
                  </TabsTrigger>
                  <TabsTrigger 
                    value="results" 
                    disabled={!diagnosticResult}
                    className="flex items-center"
                  >
                    <FileText size={16} className="mr-2" />
                    Diagnostic Results
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="input" className="mt-6">
                  <DiagnosticForm 
                    onSubmit={handleDiagnosticSubmit}
                    isLoading={isAnalyzing}
                  />
                </TabsContent>
                
                <TabsContent value="results" className="mt-6">
                  {diagnosticResult ? (
                    <ResultsDisplay 
                      result={diagnosticResult}
                      onClose={clearResults}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-secondary-foreground">
                        Submit biomarker data to view diagnostic results.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
              <AlertCircle size={20} className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Clinical Use Disclaimer</h3>
                <p className="text-sm text-secondary-foreground">
                  This tool is designed as a clinical decision support system for healthcare professionals. Results should be interpreted in conjunction with clinical findings, pathology reports, and established clinical guidelines. This tool does not replace clinical judgment or established diagnostic procedures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DiagnosticTool;
