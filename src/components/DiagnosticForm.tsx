
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { BiomarkerValue } from '@/utils/diagnosticUtils';
import { Info, AlertCircle, PlusCircle, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBiomarkers, BiomarkerState } from '@/hooks/useBiomarkers';
import AddBiomarkerForm from '@/components/AddBiomarkerForm';

interface DiagnosticFormProps {
  onSubmit: (values: BiomarkerValue[]) => void;
  isLoading: boolean;
}

const DiagnosticForm: React.FC<DiagnosticFormProps> = ({ onSubmit, isLoading }) => {
  const { toast } = useToast();
  const { 
    biomarkers, 
    addBiomarker, 
    updateBiomarkerValue, 
    removeBiomarker, 
    getBiomarkerValues,
    customBiomarkers
  } = useBiomarkers();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleInputChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    updateBiomarkerValue(id, numValue);
  };

  const handleSliderChange = (id: string, value: number[]) => {
    updateBiomarkerValue(id, value[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format data for submission
    const formattedValues = getBiomarkerValues();
    
    onSubmit(formattedValues);
  };

  // Get biomarker description for tooltip
  const getBiomarkerDescription = (id: string) => {
    switch (id) {
      case "CA153": return "Cancer Antigen 15-3 is used to monitor breast cancer. Elevated levels may indicate disease progression.";
      case "CEA": return "Carcinoembryonic Antigen is elevated in various cancers including breast cancer, especially with metastasis.";
      case "HER2": return "Human Epidermal Growth Factor Receptor 2 status affects treatment options. Scored from 0 to 3+.";
      case "Ki67": return "Ki-67 is a protein marker for cell proliferation. Higher values indicate more aggressive tumors.";
      case "ER": return "Estrogen Receptor status determines eligibility for hormonal therapy. Reported as percentage of positive cells.";
      case "PR": return "Progesterone Receptor status influences treatment decisions. Reported as percentage of positive cells.";
      case "p53": return "p53 is a tumor suppressor protein. Mutations are associated with more aggressive cancer.";
      case "CTCs": return "Circulating Tumor Cells in blood correlate with metastatic potential and disease progression.";
      default: return `${id} is a custom biomarker added to the diagnostic panel.`;
    }
  };

  // Determine max value for slider based on biomarker type
  const getSliderMax = (id: string) => {
    return id === "HER2" ? 3 : 
           id === "ER" || id === "PR" ? 100 : 
           id === "CTCs" ? 50 : 
           id === "CA153" || id === "CEA" ? 150 : 100;
  };

  // Determine step value for slider and input
  const getStepValue = (id: string) => {
    return id === "CEA" ? 0.1 : 1;
  };

  return (
    <>
      {showAddForm ? (
        <AddBiomarkerForm 
          onAdd={addBiomarker}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <Card className="p-6 shadow-sm border border-gray-100 backdrop-blur-sm bg-white/90">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Biomarker Input</h3>
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddForm(true)}
                  className="text-primary"
                >
                  <PlusCircle size={16} className="mr-1" />
                  Add Biomarker
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-secondary-foreground">
                        <Info size={16} className="mr-1" />
                        Input Guide
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Biomarker Input Guide</h4>
                        <p className="text-sm text-secondary-foreground">
                          Enter patient biomarker values from blood tests and liquid biopsy results. Use the sliders or input fields to set values. Reference ranges are shown below each input.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {biomarkers.map((biomarker) => (
                <div key={biomarker.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={biomarker.id} className="flex items-center">
                      {biomarker.range.name}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-1 cursor-help">
                              <Info size={14} className="text-secondary-foreground/70" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">
                              {getBiomarkerDescription(biomarker.id)}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-3">
                        {biomarker.value} {biomarker.range.unit}
                      </span>
                      {customBiomarkers[biomarker.id] && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto text-destructive"
                          onClick={() => removeBiomarker(biomarker.id)}
                          type="button"
                          title="Remove biomarker"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Slider
                        id={`${biomarker.id}-slider`}
                        min={0}
                        max={getSliderMax(biomarker.id)}
                        step={getStepValue(biomarker.id)}
                        value={[biomarker.value]}
                        onValueChange={(value) => handleSliderChange(biomarker.id, value)}
                        className="diagnostic-input"
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        id={biomarker.id}
                        type="number"
                        value={biomarker.value}
                        onChange={(e) => handleInputChange(biomarker.id, e.target.value)}
                        step={getStepValue(biomarker.id)}
                        min={0}
                        className="diagnostic-input"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-secondary-foreground">
                    <span>Normal: &lt;{biomarker.range.normal} {biomarker.range.unit}</span>
                    <span>High: &gt;{biomarker.range.high} {biomarker.range.unit}</span>
                  </div>
                  
                  <Separator className="mt-2" />
                </div>
              ))}
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="px-8 py-2 bg-primary hover:bg-primary/90 transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Analyzing...
                  </>
                ) : (
                  'Analyze Biomarkers'
                )}
              </Button>
            </div>
            
            <div className="mt-4 flex items-center text-sm text-secondary-foreground">
              <AlertCircle size={14} className="mr-2" />
              <span>
                This tool is for clinical decision support only. Results should be interpreted by qualified healthcare professionals in conjunction with clinical findings.
              </span>
            </div>
          </form>
        </Card>
      )}
    </>
  );
};

export default DiagnosticForm;
