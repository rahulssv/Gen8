
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClinicalTrial {
  id: string;
  title: string;
  phase: string;
  status: string;
  locations: string[];
  startDate: string;
  primaryCompletion?: string;
  interventions: string[];
  url: string;
}

interface ClinicalTrialsCardProps {
  trials: ClinicalTrial[];
}

const ClinicalTrialsCard = ({ trials }: ClinicalTrialsCardProps) => {
  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-3">
        <Badge variant="outline" className="mb-2 bg-insight-50 text-insight-700 border-insight-200">
          Research
        </Badge>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Clinical Trials
        </CardTitle>
      </CardHeader>
      <CardContent className="py-5">
        <div className="space-y-6">
          {trials.map((trial) => (
            <div key={trial.id} className="pb-5 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
              <div className="flex items-start space-x-3 mb-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {trial.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={
                      trial.status === "Recruiting" ? "bg-green-100 text-green-800" :
                      trial.status === "Active, not recruiting" ? "bg-blue-100 text-blue-800" :
                      trial.status === "Completed" ? "bg-gray-100 text-gray-800" :
                      trial.status === "Not yet recruiting" ? "bg-amber-100 text-amber-800" :
                      "bg-gray-100 text-gray-800"
                    }>
                      {trial.status}
                    </Badge>
                    <Badge variant="outline">
                      Phase {trial.phase}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="ml-8 space-y-3 text-sm">
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Start Date: {trial.startDate}
                      {trial.primaryCompletion && (
                        <> · Est. Completion: {trial.primaryCompletion}</>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {trial.locations.length > 1 
                        ? `${trial.locations.length} locations including ${trial.locations[0]}`
                        : trial.locations[0]}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Interventions:</span> {trial.interventions.join(", ")}
                  </p>
                </div>
                
                <Button variant="outline" size="sm" className="text-xs" asChild>
                  <a href={trial.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on ClinicalTrials.gov
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClinicalTrialsCard;
