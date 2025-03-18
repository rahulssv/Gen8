
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Activity, ArrowLeft, BookOpen, Bookmark, FileText, Key, Loader2, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { biomarkerDataService } from '@/services/biomarkerDataService';
import { aiDiagnosticService } from '@/services/aiDiagnosticService';

const BiomarkerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [biomarker, setBiomarker] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<any | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [questionResponse, setQuestionResponse] = useState<{ answer: string, sources: string[] } | null>(null);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  useEffect(() => {
    const fetchBiomarker = async () => {
      setLoading(true);
      try {
        // Get biomarker data from service
        const ranges = await biomarkerDataService.getBiomarkerRanges();
        const biomarkerData = Object.entries(ranges).find(([key]) => key === id);
        
        if (!biomarkerData) {
          toast({
            title: "Biomarker not found",
            description: `Could not find biomarker with ID: ${id}`,
            variant: "destructive"
          });
          return;
        }
        
        setBiomarker({
          id: biomarkerData[0],
          ...biomarkerData[1]
        });
        
        // Check if API key exists
        const key = aiDiagnosticService.getApiKey();
        if (!key) {
          setApiKeyDialogOpen(true);
        } else {
          setApiKey(key);
          // Load AI insights if API key is available
          fetchAiInsights(biomarkerData[0], biomarkerData[1].name);
        }
      } catch (error) {
        console.error("Error fetching biomarker data:", error);
        toast({
          title: "Error",
          description: "Failed to load biomarker data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBiomarker();
    }
  }, [id, toast]);
  
  const extractJson = (text: string): string | null => {
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*?}/);
    return jsonMatch ? jsonMatch[1] || jsonMatch[0] : null;
  };
  
  const fetchAiInsights = async (biomarkerId: string, biomarkerName: string) => {
    setInsightsLoading(true);
    const prompt = `Provide comprehensive information about the biomarker "${biomarkerName}" (${biomarkerId}) in breast cancer diagnostics and monitoring. Include:
                    
  1. Brief overview and definition
  2. Clinical significance in breast cancer
  3. Normal ranges and interpretation of abnormal values
  4. Recent research findings 
  5. Association with different breast cancer subtypes
  6. Cite specific research papers for each key point
  7. Format as JSON with the following structure:
  {
    "name": "biomarker name",
    "category": "type of biomarker (e.g. tumor marker, hormone receptor)",
    "description": "detailed biomarker description",
    "clinicalSignificance": "significance in breast cancer",
    "subtypeAssociations": ["list of breast cancer subtypes associated with"],
    "researchHighlights": ["list of key research findings"],
    "sources": ["research paper citations"]
  }`;
    try {
      const apiKey = aiDiagnosticService.getApiKey();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096,
          },
        }),
      });
  
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
  
      const { candidates } = await response.json();
      const generatedText = candidates?.[0]?.content?.parts?.[0]?.text;
  
      if (!generatedText) {
        throw new Error("No generated text in AI response");
      }
  
      const jsonString = extractJson(generatedText);
      if (!jsonString) {
        throw new Error("Could not parse AI response");
      }
  
      const insightsData = JSON.parse(jsonString);
      setAiInsights(insightsData);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      toast({
        title: "Error loading insights",
        description: "Failed to load AI-generated biomarker insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInsightsLoading(false);
    }
  };  
  
  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setAskingQuestion(true);
    const questionText = question;
    setQuestion(''); // Clear input
    
    try {
      // Check if API key is set
      if (!aiDiagnosticService.getApiKey()) {
        setApiKeyDialogOpen(true);
        setAskingQuestion(false);
        return;
      }
      
      // Call Gemini API for question response
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${aiDiagnosticService.getApiKey()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Answer this question about the biomarker ${biomarker?.name} (${id}) in the context of breast cancer diagnostics and research:
                  
Question: "${questionText}"

Provide a comprehensive, evidence-based answer citing specific research papers. Include recent studies when possible. Format your response as JSON:

{
  "answer": "detailed answer to the question",
  "sources": ["list of research papers cited"]
}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096,
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;
      
      // Extract JSON from response
      let jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                    generatedText.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        const responseData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        setQuestionResponse(responseData);
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch (error) {
      console.error("Error asking question:", error);
      toast({
        title: "Error",
        description: "Failed to get response to your question. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAskingQuestion(false);
    }
  };
  
  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid Gemini API key",
        variant: "destructive",
      });
      return;
    }
    
    aiDiagnosticService.setApiKey(apiKey.trim());
    setApiKeyDialogOpen(false);
    
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved",
    });
    
    // Fetch insights now that we have the API key
    if (biomarker) {
      fetchAiInsights(biomarker.id, biomarker.name);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg">Loading biomarker data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!biomarker) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl font-bold mb-4">Biomarker Not Found</h1>
              <p className="mb-8">The requested biomarker could not be found.</p>
              <Button asChild>
                <Link to="/reference">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Reference
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link 
                to="/reference"
                className="inline-flex items-center text-primary hover:text-primary/80 mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Biomarker Reference
              </Link>
              
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold">{biomarker.name}</h1>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApiKeyDialogOpen(true)}
                  className="ml-4"
                >
                  <Key className="h-4 w-4 mr-2" />
                  API Key
                </Button>
              </div>
              
              <div className="flex items-center space-x-3 mb-6">
                <Badge variant="outline">{id}</Badge>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{biomarker.unit}</Badge>
              </div>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Reference Ranges
                </CardTitle>
                <CardDescription>
                  Standard clinical reference ranges for {biomarker.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Normal</div>
                      <div className="font-medium mt-1">&lt; {biomarker.normal} {biomarker.unit}</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Elevated</div>
                      <div className="font-medium mt-1">{biomarker.normal} - {biomarker.high} {biomarker.unit}</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">High</div>
                      <div className="font-medium mt-1">{biomarker.high} - {biomarker.critical} {biomarker.unit}</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Critical</div>
                      <div className="font-medium mt-1">&gt; {biomarker.critical} {biomarker.unit}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="flex h-full">
                        <div className="h-full bg-green-300" style={{ width: '25%' }}></div>
                        <div className="h-full bg-yellow-300" style={{ width: '25%' }}></div>
                        <div className="h-full bg-orange-300" style={{ width: '25%' }}></div>
                        <div className="h-full bg-red-300" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                      <span>Normal</span>
                      <span>Elevated</span>
                      <span>High</span>
                      <span>Critical</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" />
                  AI-Generated Research Insights
                </CardTitle>
                <CardDescription>
                  Insights based on published research papers about {biomarker.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insightsLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 text-sm text-center text-muted-foreground">
                      Analyzing research papers about {biomarker.name}...
                    </p>
                  </div>
                ) : aiInsights ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium mb-2">Description</h3>
                      <p className="text-secondary-foreground">{aiInsights.description}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-md font-medium mb-2">Clinical Significance</h3>
                      <p className="text-secondary-foreground">{aiInsights.clinicalSignificance}</p>
                    </div>
                    
                    {aiInsights.subtypeAssociations && aiInsights.subtypeAssociations.length > 0 && (
                      <>
                        <Separator />
                        
                        <div>
                          <h3 className="text-md font-medium mb-2">Associated Cancer Subtypes</h3>
                          <div className="flex flex-wrap gap-2">
                            {aiInsights.subtypeAssociations.map((subtype: string, i: number) => (
                              <Badge key={i} variant="secondary">{subtype}</Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {aiInsights.researchHighlights && aiInsights.researchHighlights.length > 0 && (
                      <>
                        <Separator />
                        
                        <div>
                          <h3 className="text-md font-medium mb-2">Research Highlights</h3>
                          <ul className="space-y-2">
                            {aiInsights.researchHighlights.map((highlight: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <div className="h-5 w-5 flex items-center justify-center text-primary mr-2">•</div>
                                <span className="text-secondary-foreground">{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    {aiInsights.sources && aiInsights.sources.length > 0 && (
                      <>
                        <Separator />
                        
                        <div>
                          <h3 className="flex items-center text-md font-medium mb-2">
                            <Bookmark className="h-4 w-4 mr-2 text-primary" />
                            Research Sources
                          </h3>
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <ul className="space-y-2 text-sm">
                              {aiInsights.sources.map((source: string, i: number) => (
                                <li key={i} className="py-1 border-b border-slate-100 last:border-0">
                                  {source}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      AI insights could not be loaded. 
                      <Button 
                        variant="link" 
                        className="px-1" 
                        onClick={() => biomarker && fetchAiInsights(biomarker.id, biomarker.name)}
                      >
                        Try again
                      </Button>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Ask About This Biomarker
                </CardTitle>
                <CardDescription>
                  Ask specific questions about {biomarker.name} to get AI-generated, research-based answers
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div className="flex">
                    <Textarea
                      placeholder={`E.g., "What's the correlation between ${biomarker.name} levels and treatment response?"`}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="flex-1 resize-none"
                    />
                    <Button 
                      className="ml-2 self-end" 
                      onClick={askQuestion}
                      disabled={askingQuestion || !question.trim()}
                    >
                      {askingQuestion ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Ask
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {questionResponse && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <h4 className="font-medium mb-3">Research-Based Answer:</h4>
                      <p className="text-secondary-foreground whitespace-pre-line mb-4">
                        {questionResponse.answer}
                      </p>
                      
                      {questionResponse.sources && questionResponse.sources.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium flex items-center mb-2">
                            <Bookmark className="h-3 w-3 mr-1 text-primary" />
                            Sources
                          </h5>
                          <div className="bg-white rounded p-3">
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {questionResponse.sources.map((source, i) => (
                                <li key={i}>{source}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-4">
                <p>
                  AI-generated responses are based on published research but should be verified with healthcare professionals.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Gemini API Key</DialogTitle>
            <DialogDescription>
              This feature uses Google's Gemini AI to provide research-based insights.
              Please enter your Gemini API key to enable AI-powered features.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="api-key" className="text-right">
                API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="col-span-3"
              />
            </div>
            <div className="col-span-4 text-xs text-muted-foreground">
              Your API key is stored locally in your browser and never sent to our servers.
              <a 
                href="https://ai.google.dev/tutorials/setup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline ml-1"
              >
                Get a Gemini API key
              </a>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" onClick={saveApiKey}>Save API Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default BiomarkerDetail;
