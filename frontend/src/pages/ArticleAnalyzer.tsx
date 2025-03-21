
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { analyzeSingleArticle, generatePdfReport } from '@/api/api';
import { ExtractionResult } from '@/api/types';
import { Loader2, Link, Upload, FileText, Download, CheckCircle } from 'lucide-react';

const ArticleAnalyzer = () => {
  const { toast } = useToast();
  const [articleUrl, setArticleUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleUrlAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!articleUrl) {
      toast({
        title: "URL required",
        description: "Please enter an article URL",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const data = await analyzeSingleArticle(articleUrl);
      setResult(data);
      toast({
        title: "Analysis complete",
        description: "Article has been successfully analyzed",
      });
    } catch (err) {
      console.error('Analysis error:', err);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pdfFile) {
      toast({
        title: "File required",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    setResult(null);
    
    // In a real implementation, you would process the uploaded file
    // For now, we'll just simulate the process with a delay
    
    try {
      // Simulating PDF processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      const data = await analyzeSingleArticle("file://" + pdfFile.name);
      setResult(data);
      toast({
        title: "Analysis complete",
        description: "PDF has been successfully analyzed",
      });
    } catch (err) {
      console.error('Analysis error:', err);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!result) return;
    
    setIsPdfGenerating(true);
    setPdfUrl(null);
    
    try {
      const url = await generatePdfReport(result);
      setPdfUrl(url);
      toast({
        title: "PDF generated",
        description: "Your report is ready to download",
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast({
        title: "PDF generation failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Article Analyzer
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Extract key information and generate summaries from individual research articles
          </p>
        </div>
        
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="url">Analyze URL</TabsTrigger>
            <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="mt-0">
            <Card className="mb-10">
              <CardHeader>
                <CardTitle>Analyze Article URL</CardTitle>
                <CardDescription>
                  Enter the URL of a research article from PubMed, Taylor & Francis, or other sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUrlAnalyze}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="url">Article URL</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <Link className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input
                            id="url"
                            placeholder="https://pubmed.ncbi.nlm.nih.gov/12345678/"
                            className="pl-10"
                            value={articleUrl}
                            onChange={(e) => setArticleUrl(e.target.value)}
                          />
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isAnalyzing || !articleUrl}
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            'Analyze'
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        For example: https://pubmed.ncbi.nlm.nih.gov/12345678/
                      </p>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pdf" className="mt-0">
            <Card className="mb-10">
              <CardHeader>
                <CardTitle>Upload PDF Article</CardTitle>
                <CardDescription>
                  Upload a research article in PDF format for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFileUpload}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="pdf">PDF File</Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                        {pdfFile ? (
                          <div className="space-y-2">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                            <p className="text-sm font-medium">{pdfFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => setPdfFile(null)}
                            >
                              Change File
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm font-medium">Drag & drop or click to upload</p>
                            <p className="text-xs text-gray-500">
                              Supports PDF files up to 10MB
                            </p>
                            <Input
                              id="pdf"
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('pdf')?.click()}
                            >
                              Select File
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isAnalyzing || !pdfFile}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze PDF'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Results */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Analysis Results
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Key information extracted from the article
                  </p>
                </div>
                <Button
                  onClick={handleGeneratePdf}
                  disabled={isPdfGenerating}
                  className="flex items-center"
                >
                  {isPdfGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : pdfUrl ? (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate PDF
                    </>
                  )}
                </Button>
              </div>
              
              <div className="p-6">
                {/* Summary */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Summary
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
                    {result.summary}
                  </p>
                </div>
                
                <Separator className="my-6" />
                
                {/* Entities & Relations */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Entities & Relationships
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Key Entities
                      </h4>
                      <div className="space-y-2">
                        {result.entities.map((entity, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center">
                              <Badge className={
                                entity.type === 'biomarker' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                entity.type === 'mutation' ? 'bg-red-100 text-red-800 border-red-200' :
                                entity.type === 'drug' ? 'bg-green-100 text-green-800 border-green-200' :
                                entity.type === 'disease' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                entity.type === 'clinical trial' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                              }>
                                {entity.type}
                              </Badge>
                              <span className="ml-2 text-gray-900 dark:text-white font-medium">
                                {entity.name}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {entity.mentions} mentions
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Relationships
                      </h4>
                      <div className="space-y-2">
                        {result.relations.map((relation, index) => (
                          <div 
                            key={index} 
                            className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-900 dark:text-white font-medium">
                                {relation.subject}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(relation.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-400 italic">
                                {relation.predicate}
                              </span>
                              <span className="mx-1">→</span>
                              <span className="text-gray-800 dark:text-gray-200 font-medium">
                                {relation.object}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                {/* Statistical Data */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Statistical Data
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.statistics.map((stat, index) => (
                      <div 
                        key={index} 
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                          {stat.type}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}{stat.unit ? ` ${stat.unit}` : ''}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {stat.context}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Coexisting Factors */}
                {result.coexistingFactors.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Coexisting Factors
                      </h3>
                      
                      <div className="flex flex-wrap gap-2">
                        {result.coexistingFactors.map((factor, index) => (
                          <Badge 
                            key={index}
                            variant="secondary"
                            className="text-sm px-3 py-1"
                          >
                            {factor}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        These factors may influence treatment efficacy or prognosis when present together.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleAnalyzer;
