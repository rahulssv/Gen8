
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitCompare } from 'lucide-react';

interface CoexistingBiomarker {
  name: string;
  type: string;
  effect: 'Synergistic' | 'Antagonistic' | 'No effect' | 'Variable';
  clinicalImplication: string;
  frequencyOfCooccurrence?: string;
}

interface CoexistingBiomarkersCardProps {
  biomarkers: CoexistingBiomarker[];
}

const CoexistingBiomarkersCard = ({ biomarkers }: CoexistingBiomarkersCardProps) => {
  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-3">
        <Badge variant="outline" className="mb-2 bg-insight-50 text-insight-700 border-insight-200">
          Molecular
        </Badge>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Coexisting Biomarkers & Mutations
        </CardTitle>
      </CardHeader>
      <CardContent className="py-5">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {biomarkers.map((biomarker, index) => (
            <div key={index} className={`py-4 ${index === 0 ? 'pt-0' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <GitCompare className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">{biomarker.name}</h3>
                </div>
                <Badge className={
                  biomarker.effect === "Synergistic" ? "bg-green-100 text-green-800" :
                  biomarker.effect === "Antagonistic" ? "bg-red-100 text-red-800" :
                  biomarker.effect === "No effect" ? "bg-gray-100 text-gray-800" :
                  "bg-purple-100 text-purple-800"
                }>
                  {biomarker.effect}
                </Badge>
              </div>
              <div className="mb-2">
                <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {biomarker.type}
                </Badge>
              </div>
              {biomarker.frequencyOfCooccurrence && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-medium">Co-occurrence rate:</span> {biomarker.frequencyOfCooccurrence}
                </p>
              )}
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Clinical implication:</span> {biomarker.clinicalImplication}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CoexistingBiomarkersCard;
