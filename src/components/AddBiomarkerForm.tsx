
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, X } from 'lucide-react';
import { BiomarkerRange } from '@/utils/diagnosticUtils';

interface AddBiomarkerFormProps {
  onAdd: (biomarker: BiomarkerRange) => boolean;
  onCancel: () => void;
}

const AddBiomarkerForm: React.FC<AddBiomarkerFormProps> = ({ onAdd, onCancel }) => {
  const [biomarker, setBiomarker] = useState<BiomarkerRange>({
    name: '',
    low: 0,
    normal: 0,
    high: 0,
    critical: 0,
    unit: ''
  });

  const handleChange = (field: keyof BiomarkerRange, value: string | number) => {
    setBiomarker(prev => ({
      ...prev,
      [field]: field === 'name' || field === 'unit' ? value : Number(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    if (!biomarker.name.trim()) {
      return;
    }
    
    const success = onAdd(biomarker);
    
    if (success) {
      // Reset form
      setBiomarker({
        name: '',
        low: 0,
        normal: 0,
        high: 0,
        critical: 0,
        unit: ''
      });
    }
  };

  return (
    <Card className="p-6 shadow-sm border border-gray-100 backdrop-blur-sm bg-white/90">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Add New Biomarker</h3>
        <Button variant="ghost" size="sm" onClick={onCancel} aria-label="Close">
          <X size={16} />
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="biomarker-name">Biomarker Name</Label>
              <Input 
                id="biomarker-name" 
                value={biomarker.name} 
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g., Interleukin-6"
                required
              />
            </div>
            <div>
              <Label htmlFor="biomarker-unit">Unit</Label>
              <Input 
                id="biomarker-unit" 
                value={biomarker.unit} 
                onChange={e => handleChange('unit', e.target.value)}
                placeholder="e.g., pg/mL"
                required
              />
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="biomarker-low">Low Value</Label>
              <Input 
                id="biomarker-low" 
                type="number"
                value={biomarker.low} 
                onChange={e => handleChange('low', e.target.value)}
                min={0}
                step={0.1}
                required
              />
            </div>
            <div>
              <Label htmlFor="biomarker-normal">Normal Threshold</Label>
              <Input 
                id="biomarker-normal" 
                type="number"
                value={biomarker.normal} 
                onChange={e => handleChange('normal', e.target.value)}
                min={0}
                step={0.1}
                required
              />
            </div>
            <div>
              <Label htmlFor="biomarker-high">High Threshold</Label>
              <Input 
                id="biomarker-high" 
                type="number"
                value={biomarker.high} 
                onChange={e => handleChange('high', e.target.value)}
                min={0}
                step={0.1}
                required
              />
            </div>
            <div>
              <Label htmlFor="biomarker-critical">Critical Threshold</Label>
              <Input 
                id="biomarker-critical" 
                type="number"
                value={biomarker.critical} 
                onChange={e => handleChange('critical', e.target.value)}
                min={0}
                step={0.1}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="pt-2 flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-primary hover:bg-primary/90"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Biomarker
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AddBiomarkerForm;
