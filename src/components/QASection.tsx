
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIQuestion } from '@/utils/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QASectionProps {
  questions: AIQuestion[];
}

const QASection = ({ questions }: QASectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-3">
        <Badge variant="outline" className="mb-2 bg-insight-50 text-insight-700 border-insight-200">
          AI Insights
        </Badge>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Common Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3">
        <div className="space-y-2">
          {questions.map((qa, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                onClick={() => toggleQuestion(index)}
              >
                <span>{qa.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </Button>
              {openIndex === index && (
                <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-sm animate-slide-down">
                  {qa.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QASection;
