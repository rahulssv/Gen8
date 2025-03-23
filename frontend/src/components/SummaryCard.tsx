import { Entity, QueryResult } from '@/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PDFExport from './PDFExport';
import { Download, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/api/config';

interface SummaryCardProps {
  result: QueryResult;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours cache duration

const SummaryCard = ({ result }: SummaryCardProps) => {
  const [showPdfExport, setShowPdfExport] = useState(false);
  const [resultSet, setResultSet] = useState({});
  const [keyFinindings, setKeyFindings] = useState([]);
  const [keyEntities, setKeyEntities] = useState<Entity[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    summary: true,
    statistics: true,
    entities: true
  });

  useEffect(() => {
    const queryParam = localStorage.getItem('query');
    if (!result || !queryParam) return;

    const fetchAndCacheData = async () => {
      try {
        setLoadingStates({
          summary: true,
          statistics: true,
          entities: true
        });

        const [summaryRes, keyFRes, keyERes] = await Promise.all([
          axios.get(`${API_BASE_URL}/summary?query=${queryParam}`),
          axios.get(`${API_BASE_URL}/key_findings?query=${queryParam}`),
          axios.get(`${API_BASE_URL}/key_entities?query=${queryParam}`)
        ]);

        const cacheData = {
          summary: summaryRes.data,
          keyFindings: keyFRes.data,
          keyEntities: keyERes.data,
          timestamp: Date.now()
        };

        localStorage.setItem(`queryData-${queryParam}`, JSON.stringify(cacheData));

        setResultSet(cacheData.summary);
        setKeyFindings(cacheData.keyFindings);
        setKeyEntities(cacheData.keyEntities);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingStates({
          summary: false,
          statistics: false,
          entities: false
        });
      }
    };

    const cacheKey = `queryData-${queryParam}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const isCacheValid = Date.now() - parsedData.timestamp < CACHE_DURATION;

      if (isCacheValid) {
        setResultSet(parsedData.summary);
        setKeyFindings(parsedData.keyFindings);
        setKeyEntities(parsedData.keyEntities);
        setLoadingStates({
          summary: false,
          statistics: false,
          entities: false
        });
        return;
      }
    }

    fetchAndCacheData();
  }, [result]);

  // Check if any section is still loading
  const isAnyLoading = Object.values(loadingStates).some(state => state === true);


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
            disabled={isAnyLoading}
          >
            {isAnyLoading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-1" />
            )}
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
            {loadingStates.summary ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-insight-500" />
                <span className="ml-2 text-gray-500">Loading summary...</span>
              </div>
            ) : (
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {JSON.stringify(resultSet, null, 2)}
              </p>
            )}

          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Key Findings
            </h3>
            {loadingStates.statistics ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-insight-500" />
                <span className="ml-2 text-gray-500">Loading findings...</span>
              </div>
            ) : (
              <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-200">
                {keyFinindings.map((stat, index) => (
                  <li key={index} className="leading-relaxed">
                    <span className="font-medium">
                      {stat.category
                        .replace(/_/g, ' ') 
                        .split(' ') 
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}  
                    </span>
                    
                    <span className="text-gray-600 dark:text-gray-400 text-sm">: {stat.finding}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Key Entities Identified
            </h3>
            {loadingStates.entities ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-insight-500" />
                <span className="ml-2 text-gray-500">Loading findings...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {keyEntities.map((entity, index) => (
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
            )}
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