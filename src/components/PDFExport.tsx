
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Download } from 'lucide-react';
import { QueryResult } from '@/utils/types';
import { generatePdfReport } from '@/utils/api';

interface PDFExportProps {
  result: QueryResult;
  onClose: () => void;
}

const PDFExport = ({ result, onClose }: PDFExportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const url = await generatePdfReport(result);
      setPdfUrl(url);
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate PDF Report</DialogTitle>
          <DialogDescription>
            Create a comprehensive PDF report with all findings and data visualizations.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {!pdfUrl ? (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Report will include:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Research summary with key findings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Statistical data and visualizations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Entity and relationship information</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>References to source articles</span>
                  </li>
                </ul>
              </div>
              
              {error && (
                <div className="p-3 text-sm rounded-md bg-red-50 text-red-700 border border-red-200">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-center">Your PDF report is ready!</h3>
              <p className="text-sm text-gray-500 text-center">
                Download your report to view and share the findings.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          
          {!pdfUrl ? (
            <Button 
              onClick={handleGeneratePdf}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate PDF'
              )}
            </Button>
          ) : (
            <a
              href={pdfUrl}
              download="research-insights.pdf"
              className="inline-flex"
            >
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </a>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PDFExport;
