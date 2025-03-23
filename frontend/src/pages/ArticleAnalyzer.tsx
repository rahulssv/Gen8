import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Link, Upload, CheckCircle } from 'lucide-react';
import axios from "axios";

const ArticleAnalyzer = () => {
  const { toast } = useToast();
  const [articleUrl, setArticleUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [isPdfAnalysis, setIsPdfAnalysis] = useState(false); // Track if the analysis is for PDF

  // Handle URL analysis
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
    setIsPdfAnalysis(false); // Ensure this is set to false for URL analysis

    try {
      // Call the correct API endpoint for URL analysis (GET request)
      const response = await axios.get("https://congenial-space-journey-9qp4759gqjvcx96q-8000.app.github.dev/process-article", {
        params: { url: articleUrl }, // Pass the URL as a query parameter
      });
      setResult(response.data);
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

  // Handle PDF upload and analysis
  const handlePdfUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile) {
      toast({
        title: "PDF required",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setIsPdfAnalysis(true); // Set this to true for PDF analysis

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const response = await axios.post("https://congenial-space-journey-9qp4759gqjvcx96q-8000.app.github.dev/article", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.error) {
        toast({
          title: "Analysis failed",
          description: response.data.error,
          variant: "destructive",
        });
      } else {
        setResult(response.data);
        toast({
          title: "Analysis complete",
          description: "PDF has been successfully analyzed",
        });
      }
    } catch (err) {
      console.error('PDF Analysis error:', err);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
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

        {/* Tabs for URL and PDF Analysis */}
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="url">Analyze URL</TabsTrigger>
            <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
          </TabsList>

          {/* URL Analysis Tab */}
          <TabsContent value="url">
            <Card className="mb-10">
              <CardHeader>
                <CardTitle>Analyze Article URL</CardTitle>
                <CardDescription>
                  Enter the URL of a research article for analysis.
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
                            placeholder="https://example.com/article"
                            className="pl-10"
                            value={articleUrl}
                            onChange={(e) => setArticleUrl(e.target.value)}
                          />
                        </div>
                        <Button type="submit" disabled={isAnalyzing || !articleUrl}>
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
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PDF Upload Tab */}
          <TabsContent value="pdf">
            <Card className="mb-10">
              <CardHeader>
                <CardTitle>Upload PDF Article</CardTitle>
                <CardDescription>
                  Upload a research article in PDF format for analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePdfUpload}>
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

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-fade-in mt-10">
            {/* Summary */}
            {result.summary && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Summary
                </h2>
                <p className="text-gray-700 dark:text-gray-300">{result.summary}</p>
              </div>
            )}

            {/* Key Findings for PDF */}
            {isPdfAnalysis && result.key_findings?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Key Findings
                </h2>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                  {result.key_findings.map((finding: any, index: number) => (
                    <li key={index}>{finding.point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keywords for URL */}
            {!isPdfAnalysis && result.keywords?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Keywords
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleAnalyzer;