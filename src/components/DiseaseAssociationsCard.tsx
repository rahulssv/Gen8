
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartPulse } from 'lucide-react';

interface DiseaseAssociation {
  disease: string;
  relationship: string;
  strength: 'Strong' | 'Moderate' | 'Weak';
  evidence: string;
  notes?: string;
}

interface DiseaseAssociationsCardProps {
  associations: DiseaseAssociation[];
}

const DiseaseAssociationsCard = ({ associations }: DiseaseAssociationsCardProps) => {
  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-3">
        <Badge variant="outline" className="mb-2 bg-insight-50 text-insight-700 border-insight-200">
          Pathology
        </Badge>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Disease Associations
        </CardTitle>
      </CardHeader>
      <CardContent className="py-5">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {associations.map((association, index) => (
            <div key={index} className={`py-4 ${index === 0 ? 'pt-0' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <HeartPulse className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">{association.disease}</h3>
                </div>
                <Badge className={
                  association.strength === "Strong" ? "bg-red-100 text-red-800" :
                  association.strength === "Moderate" ? "bg-amber-100 text-amber-800" :
                  "bg-yellow-100 text-yellow-800"
                }>
                  {association.strength} Evidence
                </Badge>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <span className="font-medium">Relationship:</span> {association.relationship}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <span className="font-medium">Evidence:</span> {association.evidence}
              </p>
              {association.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  Note: {association.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiseaseAssociationsCard;
