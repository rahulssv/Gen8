import { useEffect, useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TestTube, Microscope, AlertCircle, Loader2, LineChart, ArrowRight } from 'lucide-react'; // Added Loader2
import { useToast } from '@/hooks/use-toast';
// import biomarkersData from '../../../backend/json/Biomarker.json'
import { API_BASE_URL } from '../api/config';
import { Biomarker, DiagnosticResult } from '../api/types.ts';
import axios from 'axios';

const DiagnosticTool = () => {
  const { toast } = useToast();
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResult | null>(null);
  // Added loading state for analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleBiomarkerChange = (id: string, newValue: number) => {
    const updatedData = biomarkers.map((item) => item.id === id ? {...item,value: newValue} : item)
    setBiomarkers(updatedData);

    setBiomarkers(prev => prev.map(marker => 
      marker.id === id ? { ...marker, value: newValue[0] } : marker
    ));
  };
  useEffect(()=>{
    const queryParam = localStorage.getItem('query');
    const httpUrl = `${API_BASE_URL}/biomarkers?query=` + queryParam ;
    const fetchData = async () => {
      const response = await axios.get(httpUrl);
      const data : Biomarker[] =  response.data.map((item: any) => ({
        id: item?.id,
        name: item?.name,
        value: item?.value,
        unit: item?.unit,
        normal_range: {
          min: item?.normal_range?.min,
          max: item?.normal_range?.max
        },
        description: item?.description
      })
    )
      setBiomarkers(data);
    }
    fetchData();
  },[])

  const analyzeBiomarkers = () => {
    // Set analyzing state to true
    setIsAnalyzing(true);
    axios.post(`${API_BASE_URL}/biomarkers`, biomarkers);
    // Use setTimeout to simulate processing time
    setTimeout(() => {
      const abnormalMarkers = biomarkers.filter(
        marker => marker.value < marker.normal_range.min || marker.value > marker.normal_range.max
      );

      let diagnosis = "";

      if (abnormalMarkers.length === 0) {
        diagnosis = "All biomarkers are within normal ranges. No concerning patterns detected.";
      } else {
        const glucose = biomarkers.find(m => m.id === "glucose")!;
        const a1c = biomarkers.find(m => m.id === "a1c")!;
        const ldl = biomarkers.find(m => m.id === "ldl")!;
        const hdl = biomarkers.find(m => m.id === "hdl")!;
        const triglycerides = biomarkers.find(m => m.id === "triglycerides")!;
        const cholesterol = biomarkers.find(m => m.id === "cholesterol")!;
        const crp = biomarkers.find(m => m.id === "crp")!;

        if (glucose.value > 125 && a1c.value > 6.5) {
          diagnosis = "Potential Diabetes Mellitus pattern detected. Elevated blood glucose and HbA1c suggest further evaluation for diabetes.";
        } else if (glucose.value >= 100 && glucose.value < 126 && a1c.value >= 5.7 && a1c.value < 6.5) {
          diagnosis = "Potential Prediabetes pattern detected. Blood glucose and HbA1c values suggest increased risk for developing diabetes.";
        } else if (ldl.value > 130 && cholesterol.value > 240 && triglycerides.value > 150) {
          diagnosis = "Potential Hyperlipidemia pattern detected. Elevated LDL, total cholesterol, and triglycerides indicate increased cardiovascular risk.";
        } else if (crp.value > 10) {
          diagnosis = "Significant inflammation detected. Elevated C-reactive protein may indicate infection, tissue injury, or chronic inflammatory conditions.";
        } else {
          diagnosis = `The following biomarkers are outside normal ranges: ${abnormalMarkers.map(m => m.name).join(", ")}. Consider consulting with a healthcare provider.`;
        }
      }

      setDiagnosisResult(diagnosis);
      // Set analyzing state back to false
      setIsAnalyzing(false);

      toast({
        title: "Analysis Complete",
        description: "Your biomarker analysis has been completed.",
      });
    }, 1500); // 1.5 second delay to show loading state
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Biomarker Diagnostic Tool
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Adjust biomarker values to simulate diagnostic results. This tool provides educational information only and is not a substitute for medical advice.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-sm border border-gray-200 dark:border-gray-800">
              <CardHeader className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-3">
                <Badge variant="outline" className="mb-2 bg-insight-50 text-insight-700 border-insight-200">
                  Biomarker Inputs
                </Badge>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Adjust Biomarker Values
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {biomarkers.map((marker) => (
                    <div key={marker.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={marker.id} className="text-base font-medium">
                          {marker.name}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={marker.value < marker.normal_range.min || marker.value > marker.normal_range.max 
                              ? "destructive" 
                              : "outline"}
                            className="px-2 py-0.5"
                          >
                            {marker.value} {marker.unit}
                          </Badge>
                          <Badge variant="outline" className="px-2 py-0.5 text-xs">
                            Normal: {marker.normal_range.min}-{marker.normal_range.max} {marker.unit}
                          </Badge>
                        </div>
                      </div>
                      <Slider
                        id={marker.id}
                        min={marker.normal_range.min * 0.5}
                        max={marker.normal_range.max * 2}
                        step={marker.id === 'a1c' ? 0.1 : 1}
                        value={[marker.value]}
                        onValueChange={(value) => handleBiomarkerChange(marker.id, value)}
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {marker.description}
                      </p>
                    </div>
                  ))}
                  <Button
                    onClick={analyzeBiomarkers}
                    className="w-full mt-4 bg-insight-500 hover:bg-insight-600"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TestTube className="mr-2 h-4 w-4" />
                        Analyze Biomarkers
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-sm border border-gray-200 dark:border-gray-800 h-full">
              <CardHeader className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-3">
                <Badge variant="outline" className="mb-2 bg-insight-50 text-insight-700 border-insight-200">
                  Analysis Results
                </Badge>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Diagnostic Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isAnalyzing ? (
                  // Show loading state while analyzing
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Loader2 className="h-12 w-12 text-insight-500 dark:text-insight-400 animate-spin mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Analyzing biomarker patterns...
                    </p>
                  </div>
                ) : diagnosisResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-insight-50 dark:bg-insight-900/20 border border-insight-200 dark:border-insight-800">
                      <div className="flex items-start">
                        <Microscope className="h-6 w-6 text-insight-600 mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-insight-700 dark:text-insight-300 mb-1">Summary</h3>
                          <p className="text-gray-800 dark:text-gray-200 mb-2">
                            {diagnosisResult}
                          </p>
                          
                          {diagnosticData && (
                            <Badge 
                              className={`mt-1 ${
                                diagnosticData.risk_level === "low" 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : diagnosticData.risk_level === "moderate"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : diagnosticData.risk_level === "high"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-purple-100 text-purple-800 border-purple-200"
                              }`}
                            >
                              {diagnosticData.risk_level === "low" 
                                ? "Low Risk" 
                                : diagnosticData.risk_level === "moderate"
                                ? "Moderate Risk"
                                : diagnosticData.risk_level === "high"
                                ? "High Risk"
                                : "Very High Risk"
                              }
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {diagnosticData && diagnosticData.abnormal_markers.length > 0 && (
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                          <LineChart className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                          Abnormal Biomarkers
                        </h3>
                        <div className="space-y-3">
                          {diagnosticData.abnormal_markers.map((marker) => (
                            <div key={marker.id} className="flex justify-between text-sm">
                              <div className="font-medium text-gray-700 dark:text-gray-300">
                                {marker.name}
                              </div>
                              <div className="flex items-center">
                                <span className={`${
                                  marker.deviation === "above" 
                                    ? "text-red-600 dark:text-red-400" 
                                    : "text-amber-600 dark:text-amber-400"
                                }`}>
                                  {marker.value} {marker.unit}
                                </span>
                                <ArrowRight className="h-3 w-3 mx-1 text-gray-400" />
                                <span className={`${
                                  marker.deviation === "above" 
                                    ? "text-red-600 dark:text-red-400" 
                                    : "text-amber-600 dark:text-amber-400"
                                }`}>
                                  {marker.deviation_percentage}% {marker.deviation}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {diagnosticData && diagnosticData.potential_conditions.length > 0 && (
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <h3 className="font-medium text-red-800 dark:text-red-200 mb-3">
                          Potential Conditions
                        </h3>
                        <div className="space-y-4">
                          {diagnosticData.potential_conditions.map((condition, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="font-medium text-red-700 dark:text-red-300">
                                  {condition.name}
                                </div>
                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                  {condition.probability}% match
                                </Badge>
                              </div>
                              <p className="text-sm text-red-600 dark:text-red-400">
                                {condition.description}
                              </p>
                              <div className="text-sm text-red-700 dark:text-red-300 pl-3 border-l-2 border-red-300 dark:border-red-700">
                                <span className="font-medium block mb-1">Recommendations:</span>
                                <ul className="list-disc pl-5 space-y-1">
                                  {condition.recommendations.map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {diagnosticData && diagnosticData.lifestyle_recommendations.length > 0 && (
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                          Lifestyle Recommendations
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-green-700 dark:text-green-300">
                          {diagnosticData.lifestyle_recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                        <div>
                          <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">Important Disclaimer</p>
                          <p className="text-amber-700 dark:text-amber-300 text-sm">
                            This analysis is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <TestTube className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Adjust biomarker values and click "Analyze Biomarkers" to see diagnostic insights.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticTool;