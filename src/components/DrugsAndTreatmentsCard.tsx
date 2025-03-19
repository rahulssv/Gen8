
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Drug {
  name: string;
  type: string;
  mechanism: string;
  efficacy: string;
  approvalStatus: string;
  url?: string;
}

interface DrugsAndTreatmentsCardProps {
  drugs: Drug[];
}

const DrugsAndTreatmentsCard = ({ drugs }: DrugsAndTreatmentsCardProps) => {
  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-3">
        <Badge variant="outline" className="mb-2 bg-insight-50 text-insight-700 border-insight-200">
          Therapeutics
        </Badge>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Drugs & Treatments
        </CardTitle>
      </CardHeader>
      <CardContent className="py-5">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {drugs.map((drug, index) => (
            <div key={index} className={`py-4 ${index === 0 ? 'pt-0' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <Pill className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">{drug.name}</h3>
                </div>
                <Badge className={
                  drug.approvalStatus === "FDA Approved" ? "bg-green-100 text-green-800" :
                  drug.approvalStatus === "Phase III" ? "bg-blue-100 text-blue-800" :
                  drug.approvalStatus === "Phase II" ? "bg-purple-100 text-purple-800" :
                  drug.approvalStatus === "Phase I" ? "bg-orange-100 text-orange-800" :
                  "bg-gray-100 text-gray-800"
                }>
                  {drug.approvalStatus}
                </Badge>
              </div>
              <div className="mb-2">
                <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {drug.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <span className="font-medium">Mechanism:</span> {drug.mechanism}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                <span className="font-medium">Efficacy:</span> {drug.efficacy}
              </p>
              {drug.url && (
                <Button variant="outline" size="sm" className="text-xs" asChild>
                  <a href={drug.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    More Information
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DrugsAndTreatmentsCard;
