import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Import Badge
import { analyzeSingleArticle } from '@/api/api'; // Remove analyzePdf since it's not used
import { ExtractionResult } from '@/api/types';
import { Loader2, Link } from 'lucide-react';
import QASection from '@/components/QASection'; // Import QASection

const ArticleAnalyzer = () => {
  const { toast } = useToast();
  const [articleUrl, setArticleUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);

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
      console.log('Fetched data:', data); // Debugging: Log the fetched data
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

  const handlePdfUpload = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile) {
      toast({
        title: "PDF required",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "PDF uploaded",
      description: "PDF upload functionality is not implemented yet.",
      variant: "default",
    });
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

        {/* URL Input Form */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Analyze Article</CardTitle>
            <CardDescription>
              Enter the URL of a research article or upload a PDF file
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
                        'Analyze URL'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            <form onSubmit={handlePdfUpload} className="mt-6">
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="pdf">Upload PDF</Label>
                  <div className="flex gap-2">
                    <Input
                      id="pdf"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    />
                    <Button type="submit" disabled={!pdfFile}>
                      Upload PDF
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Title and Keywords */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Article Details
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Title:</strong> {result.title || 'N/A'}
              </p>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywords?.map((keyword, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {keyword}
                    </Badge>
                  )) || (
                    <p className="text-gray-700 dark:text-gray-300">No keywords available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            {result.summary ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Summary
                </h2>
                <p className="text-gray-700 dark:text-gray-300">{result.summary}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-gray-700 dark:text-gray-300">No summary available.</p>
              </div>
            )}

            {/* Common Questions */}
            {result.aiGeneratedQuestions?.length > 0 ? (
              <QASection questions={result.aiGeneratedQuestions} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-gray-700 dark:text-gray-300">No questions available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleAnalyzer;