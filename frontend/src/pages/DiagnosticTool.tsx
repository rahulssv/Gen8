
import { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TestTube, Microscope, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  normalRange: [number, number];
  description: string;
}

const DiagnosticTool = () => {
  const { toast } = useToast();
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([
    {
      id: "glucose",
      name: "Blood Glucose",
      value: 100,
      unit: "mg/dL",
      normalRange: [70, 100],
      description: "Measures the amount of glucose (sugar) in your blood."
    },
    {
      id: "cholesterol",
      name: "Total Cholesterol",
      value: 200,
      unit: "mg/dL",
      normalRange: [125, 200],
      description: "Measures all cholesterol in your blood."
    },
    {
      id: "hdl",
      name: "HDL Cholesterol",
      value: 55,
      unit: "mg/dL",
      normalRange: [40, 60],
      description: "High-density lipoprotein, often called 'good' cholesterol."
    },
    {
      id: "ldl",
      name: "LDL Cholesterol",
      value: 100,
      unit: "mg/dL",
      normalRange: [0, 100],
      description: "Low-density lipoprotein, often called 'bad' cholesterol."
    },
    {
      id: "triglycerides",
      name: "Triglycerides",
      value: 150,
      unit: "mg/dL",
      normalRange: [0, 150],
      description: "A type of fat in your blood that can increase risk of heart disease."
    },
    {
      id: "a1c",
      name: "HbA1c",
      value: 5.7,
      unit: "%",
      normalRange: [4.0, 5.7],
      description: "Measures your average blood glucose level over the past 2-3 months."
    },
    {
      id: "crp",
      name: "C-Reactive Protein",
      value: 2,
      unit: "mg/L",
      normalRange: [0, 3],
      description: "A marker of inflammation in the body."
    },
    {
      id: "tsh",
      name: "TSH",
      value: 2.5,
      unit: "mIU/L",
      normalRange: [0.4, 4.0],
      description: "Thyroid-stimulating hormone, which regulates thyroid function."
    }
  ]);

  const handleBiomarkerChange = (id: string, newValue: number[]) => {
    setBiomarkers(prev => prev.map(marker => 
      marker.id === id ? { ...marker, value: newValue[0] } : marker
    ));
  };

  const analyzeBiomarkers = () => {
    // This is a simplified mock diagnosis algorithm
    // In a real app, this would be more sophisticated or use an API
    
    const abnormalMarkers = biomarkers.filter(
      marker => marker.value < marker.normalRange[0] || marker.value > marker.normalRange[1]
    );

    let diagnosis = "";
    
    // Simple rule-based diagnosis
    if (abnormalMarkers.length === 0) {
      diagnosis = "All biomarkers are within normal ranges. No concerning patterns detected.";
    } else {
      // Check for specific patterns
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
        // List the abnormal biomarkers
        diagnosis = `The following biomarkers are outside normal ranges: ${abnormalMarkers.map(m => m.name).join(", ")}. Consider consulting with a healthcare provider.`;
      }
    }

    setDiagnosisResult(diagnosis);
    toast({
      title: "Analysis Complete",
      description: "Your biomarker analysis has been completed.",
    });
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
          {/* Biomarker Input Panel */}
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
                            variant={marker.value < marker.normalRange[0] || marker.value > marker.normalRange[1] 
                              ? "destructive" 
                              : "outline"}
                            className="px-2 py-0.5"
                          >
                            {marker.value} {marker.unit}
                          </Badge>
                          <Badge variant="outline" className="px-2 py-0.5 text-xs">
                            Normal: {marker.normalRange[0]}-{marker.normalRange[1]} {marker.unit}
                          </Badge>
                        </div>
                      </div>
                      <Slider 
                        id={marker.id}
                        min={marker.normalRange[0] * 0.5}
                        max={marker.normalRange[1] * 2}
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
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    Analyze Biomarkers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
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
                {diagnosisResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-insight-50 dark:bg-insight-900/20 border border-insight-200 dark:border-insight-800">
                      <div className="flex items-start">
                        <Microscope className="h-6 w-6 text-insight-600 mr-3 mt-0.5" />
                        <p className="text-gray-800 dark:text-gray-200">
                          {diagnosisResult}
                        </p>
                      </div>
                    </div>
                    
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
