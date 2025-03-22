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

import { QueryResult } from '@/api/types';

import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

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

      // Create a new PDF document
      const doc = new jsPDF();
      const logoUrl = '/logo.png';

      // For URL method, we need to fetch the image first
      const img = new Image();
      img.src = logoUrl;

      try {

        // Wait for the image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Calculate dimensions to maintain aspect ratio
        const imgWidth = 40; // Width in mm
        const imgHeight = (img.height * imgWidth) / img.width;

        // Add the image to the PDF (centered at the top)
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.addImage(img, 'PNG', 10, 10, imgWidth, imgHeight);

        // Adjust starting Y position for the rest of the content
        let currentY = 10 + imgHeight + 10; // Logo top position + logo height + margin

        // Add title (centered)
        doc.setFontSize(18);
        doc.text('Research Insights Report', 10, currentY);

        currentY += 10;

        // Add date

        doc.setFontSize(10);

        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, currentY);

        currentY += 15;

        // SECTION 1: SUMMARY
        if (result.summary) {
          doc.setFontSize(14);
          doc.text('Executive Summary', 20, currentY);
          currentY += 10;

          doc.setFontSize(10);
          const splitSummary = doc.splitTextToSize(result.summary, 170);
          doc.text(splitSummary, 20, currentY);
          currentY += (splitSummary.length * 5) + 15;
        }

        // SECTION 2: KEY BIOMARKERS
        // Extract biomarkers from entities
        const biomarkers = result.entities.filter(entity =>
          entity.type === 'biomarker'
        );

        if (biomarkers.length > 0) {
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFontSize(14);
          doc.text('Key Biomarkers', 20, currentY);
          currentY += 10;

          const biomarkerData = biomarkers.map(biomarker => [
            biomarker.name,
            biomarker.mentions,
            biomarker.relations.length > 0 ?
              biomarker.relations.map(r => `${r.subject} ${r.predicate} ${r.object}`).slice(0, 2).join('; ') :
              'No specific relations'
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [['Biomarker', 'Mentions', 'Key Relations']],
            body: biomarkerData,
            theme: 'striped',
            headStyles: { fillColor: [66, 135, 245] },
          });

          currentY = (doc as any).lastAutoTable.finalY + 15;
        }
        // SECTION 3: STATISTICAL FINDINGS
        if (result.statistics && result.statistics.length > 0) {
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFontSize(14);
          doc.text('Statistical Findings', 20, currentY);
          currentY += 10;

          const statData = result.statistics.map(stat => [
            stat.type,
            typeof stat.value === 'number' ? stat.value.toString() : stat.value,
            stat.unit || 'N/A',
            stat.context
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [['Type', 'Value', 'Unit', 'Context']],
            body: statData,
            theme: 'striped',
            headStyles: { fillColor: [66, 135, 245] },
          });

          currentY = (doc as any).lastAutoTable.finalY + 15;
        }

        // Add page numbers
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
        }

      } catch (imgError) {
        console.error('Error loading logo:', imgError);

        // Fallback if logo loading fails - create PDF without logo
        let currentY = 20;

        // Add title
        doc.setFontSize(18);
        doc.text('Biomarker Research Report', 20, currentY);
        currentY += 10;

        // Add date and query
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, currentY);
        currentY += 5;
        doc.text(`Query: ${result.query}`, 20, currentY);
        currentY += 15;

        // Add summary section
        if (result.summary) {
          doc.setFontSize(14);
          doc.text('Executive Summary', 20, currentY);
          currentY += 10;

          doc.setFontSize(10);
          const splitSummary = doc.splitTextToSize(result.summary, 170);
          doc.text(splitSummary, 20, currentY);
          currentY += (splitSummary.length * 5) + 15;
        }

        // Add biomarkers section
        const biomarkers = result.entities.filter(entity =>
          entity.type === 'biomarker'
        );

        if (biomarkers.length > 0) {
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFontSize(14);
          doc.text('Key Biomarkers', 20, currentY);
          currentY += 10;

          const biomarkerData = biomarkers.map(biomarker => [
            biomarker.name,
            biomarker.mentions,
            biomarker.relations.length > 0 ?
              biomarker.relations.map(r => `${r.subject} ${r.predicate} ${r.object}`).slice(0, 2).join('; ') :
              'No specific relations'
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [['Biomarker', 'Mentions', 'Key Relations']],
            body: biomarkerData,
            theme: 'striped',
            headStyles: { fillColor: [66, 135, 245] },
          });

          currentY = (doc as any).lastAutoTable.finalY + 15;
        }

        // Add statistics section
        if (result.statistics && result.statistics.length > 0) {
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFontSize(14);
          doc.text('Statistical Findings', 20, currentY);
          currentY += 10;

          const statData = result.statistics.map(stat => [
            stat.type,
            typeof stat.value === 'number' ? stat.value.toString() : stat.value,
            stat.unit || 'N/A',
            stat.context
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [['Type', 'Value', 'Unit', 'Context']],
            body: statData,
            theme: 'striped',
            headStyles: { fillColor: [66, 135, 245] },
          });
        }

        // Add page numbers
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
        }
      }

      // Generate blob URL for the PDF
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
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
                    <span>Statistical data and insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Key biomarkers identified</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Biomarker relationships and significance</span>
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
              download="biomarker-research-report.pdf"
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