
import { QueryResult } from '@/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import PDFExport from './PDFExport';
import { useState } from 'react';

interface SummaryCardProps {
  result: QueryResult;
}

const SummaryCard = ({ result }: SummaryCardProps) => {
  const [showPdfExport, setShowPdfExport] = useState(false);

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="outline" className="mb-2 bg-insight-50 text-insight-700 border-insight-200">
              Evidence Summary
            </Badge>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Research Insights
            </CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center space-x-1 text-sm"
            onClick={() => setShowPdfExport(true)}
          >
            <Download className="w-4 h-4 mr-1" />
            <span>Export PDF</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Summary of Evidence
            </h3>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {result.summary}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Key Findings
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-200">
              {result.statistics.map((stat, index) => (
                <li key={index} className="leading-relaxed">
                  <span className="font-medium">{stat.type === 'survival rate' ? 'Survival: ' : 
                                                 stat.type === 'efficacy' ? 'Efficacy: ' : 
                                                 stat.type === 'p-value' ? 'Significance: ' : 
                                                 stat.type === 'hazard ratio' ? 'Hazard Ratio: ' : 
                                                 'Result: '}</span>
                  {stat.value}{stat.unit ? ` ${stat.unit}` : ''} 
                  <span className="text-gray-600 dark:text-gray-400 text-sm"> ({stat.context})</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Key Entities Identified
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.entities.map((entity, index) => (
                <Badge 
                  key={index} 
                  className={
                    entity.type === 'biomarker' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                    entity.type === 'mutation' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                    entity.type === 'drug' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    entity.type === 'disease' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                    entity.type === 'clinical trial' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                    'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }
                >
                  {entity.name} ({entity.mentions})
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      {showPdfExport && (
        <PDFExport 
          result={result} 
          onClose={() => setShowPdfExport(false)} 
        />
      )}
    </Card>
  );
};

export default SummaryCard;
