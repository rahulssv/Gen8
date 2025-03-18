
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BiomarkerRange } from '@/utils/diagnosticUtils';
import { ArrowRight } from 'lucide-react';

interface BiomarkerCardProps {
  biomarker: {
    id: string;
    name: string;
    description: string;
    significance: string;
    range: BiomarkerRange;
    normalRange: string;
    type: 'blood' | 'tissue' | 'liquid-biopsy';
  };
}

const BiomarkerCard: React.FC<BiomarkerCardProps> = ({ biomarker }) => {
  const getBiomarkerTypeColor = (type: string) => {
    switch (type) {
      case 'blood': return 'bg-blue-100 text-blue-800';
      case 'tissue': return 'bg-purple-100 text-purple-800';
      case 'liquid-biopsy': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link to={`/biomarker/${biomarker.id}`}>
      <Card className="biomarker-card hover:translate-y-[-2px] hover:shadow-md transition-all cursor-pointer group">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg group-hover:text-primary transition-colors">{biomarker.name}</h3>
          <Badge className={getBiomarkerTypeColor(biomarker.type)}>
            {biomarker.type === 'liquid-biopsy' ? 'Liquid Biopsy' : biomarker.type.charAt(0).toUpperCase() + biomarker.type.slice(1)}
          </Badge>
        </div>
        
        <p className="text-secondary-foreground text-sm mb-4">{biomarker.description}</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Clinical Significance</h4>
            <p className="text-sm">{biomarker.significance}</p>
          </div>
          
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Normal Range</h4>
            <p className="text-sm">{biomarker.normalRange}</p>
          </div>
          
          <div className="pt-2">
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="flex h-full">
                <div className="h-full bg-green-300" style={{ width: '25%' }}></div>
                <div className="h-full bg-yellow-300" style={{ width: '25%' }}></div>
                <div className="h-full bg-orange-300" style={{ width: '25%' }}></div>
                <div className="h-full bg-red-300" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div className="flex justify-between text-xs mt-1 text-gray-500">
              <span>Normal</span>
              <span>Elevated</span>
              <span>High</span>
              <span>Critical</span>
            </div>
          </div>
          
          <div className="flex justify-end items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm mr-1 font-medium">View Details</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BiomarkerCard;
