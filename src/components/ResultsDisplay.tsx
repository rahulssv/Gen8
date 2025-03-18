
import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DiagnosticResult } from '@/utils/diagnosticUtils';
import { ArrowRight, FileText, Target, AlertCircle, Activity, BookOpen, Copy, Download, X, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface ResultsDisplayProps {
  result: DiagnosticResult | null;
  onClose: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onClose }) => {
  const resultRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  if (!result) return null;

  const getRiskColor = (risk: "low" | "moderate" | "high" | "very high") => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-800";
      case "moderate": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "very high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "text-green-600";
      case "elevated": return "text-yellow-600";
      case "high": return "text-orange-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const handleCopyToClipboard = () => {
    const textToCopy = `
ONCOSIGNAL DIAGNOSTIC REPORT

CLASSIFICATION
Cancer Subtype: ${result.subtype}
Stage: ${result.stage}
Risk Level: ${result.riskLevel.toUpperCase()}

BIOMARKER ANALYSIS
${result.biomarkerAnalysis.map(bm => `- ${bm.name}: ${bm.value} (${bm.status.toUpperCase()})`).join('\n')}

RECOMMENDATIONS
${result.recommendations.map(rec => `- ${rec}`).join('\n')}

DETAILED ANALYSIS
${result.detailedAnalysis}

${result.sources ? `\nSOURCES\n${result.sources.join('\n')}` : ''}
    `.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Report copied",
        description: "Diagnostic report has been copied to clipboard",
      });
    });
  };

  const generatePDF = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = 20;
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ONCOSIGNAL DIAGNOSTIC REPORT', pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CLASSIFICATION', margin, y);
    y += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Cancer Subtype: ${result.subtype}`, margin, y);
    y += 6;
    doc.text(`Stage: ${result.stage}`, margin, y);
    y += 6;
    doc.text(`Risk Level: ${result.riskLevel.toUpperCase()}`, margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BIOMARKER ANALYSIS', margin, y);
    y += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    result.biomarkerAnalysis.forEach(bm => {
      doc.text(`${bm.name}: ${bm.value} (${bm.status.toUpperCase()})`, margin, y);
      y += 6;
    });
    y += 4;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMENDATIONS', margin, y);
    y += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    result.recommendations.forEach(rec => {
      const textLines = doc.splitTextToSize(`- ${rec}`, contentWidth);
      doc.text(textLines, margin, y);
      y += 6 * textLines.length;
    });
    y += 4;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED ANALYSIS', margin, y);
    y += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const analysisLines = doc.splitTextToSize(result.detailedAnalysis, contentWidth);
    doc.text(analysisLines, margin, y);
    y += 6 * analysisLines.length;
    
    // Add sources if available
    if (result.sources && result.sources.length > 0) {
      y += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RESEARCH PAPERS CITED', margin, y);
      y += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      result.sources.forEach(source => {
        const sourceLines = doc.splitTextToSize(source, contentWidth);
        doc.text(sourceLines, margin, y);
        y += 5 * sourceLines.length;
      });
    }
    
    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const disclaimer = "This analysis is provided as clinical decision support only based on AI evaluation of research literature. Diagnostic and treatment decisions should be made by qualified healthcare professionals considering all clinical factors.";
    const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
    doc.text(disclaimerLines, margin, y);
    
    const today = new Date();
    const dateString = today.toLocaleDateString();
    doc.text(`Report generated: ${dateString}`, margin, doc.internal.pageSize.getHeight() - 10);

    doc.save(`oncosignal-report-${dateString}.pdf`);
    
    toast({
      title: "Report generated",
      description: "Diagnostic report has been downloaded as PDF",
    });
  };

  return (
    <div ref={resultRef} className="animate-slideUp">
      <Card className="p-6 shadow-lg border border-gray-100 backdrop-blur-sm bg-white/90 relative">
        <div className="absolute top-4 right-4 flex space-x-2">
          <button 
            onClick={handleCopyToClipboard}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Copy report"
          >
            <Copy size={16} className="text-gray-500" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close results"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="flex items-center mb-6">
          <Activity size={24} className="mr-2 text-primary" />
          <h2 className="text-xl font-semibold">AI Diagnostic Assessment</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <div className="text-sm text-secondary-foreground">Cancer Subtype</div>
            <div className="font-medium text-lg">{result.subtype}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-secondary-foreground">Assessment</div>
            <div className="font-medium text-lg">{result.stage}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-secondary-foreground">Risk Level</div>
            <div>
              <Badge className={`${getRiskColor(result.riskLevel)} text-xs px-2 py-1`}>
                {result.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="mb-6">
          <h3 className="text-md font-medium flex items-center mb-4">
            <FileText size={18} className="mr-2 text-primary" />
            Detailed Analysis
          </h3>
          <p className="text-secondary-foreground whitespace-pre-line">
            {result.detailedAnalysis}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-md font-medium flex items-center mb-4">
            <Target size={18} className="mr-2 text-primary" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <ArrowRight size={16} className="mr-2 mt-1 text-primary" />
                <span className="text-secondary-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="my-6" />

        <div className="mb-6">
          <h3 className="text-md font-medium flex items-center mb-4">
            <Activity size={18} className="mr-2 text-primary" />
            Biomarker Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.biomarkerAnalysis.map((bm) => (
              <div key={bm.id} className="p-4 rounded-lg border border-gray-100 bg-white/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{bm.name}</div>
                  <Badge variant="outline" className={`${getStatusColor(bm.status)} text-xs border-current`}>
                    {bm.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-lg font-semibold mb-2">{bm.value}</div>
                <p className="text-xs text-secondary-foreground">{bm.significance}</p>
              </div>
            ))}
          </div>
        </div>

        {result.sources && result.sources.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-medium flex items-center mb-4">
              <Bookmark size={18} className="mr-2 text-primary" />
              Research Paper Citations
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100"> 
              <ul className="space-y-2 text-sm text-secondary-foreground">
                {result.sources.map((source, index) => (
                  <li key={index} className="flex items-start py-2 border-b border-gray-100 last:border-0">
                    <ArrowRight size={14} className="mr-2 mt-1 text-primary" />
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline hover:text-primary"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              These research papers were analyzed by AI to generate this diagnostic assessment.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center text-xs text-secondary-foreground bg-yellow-50 p-3 rounded-md border border-yellow-100">
          <AlertCircle size={14} className="mr-2 text-yellow-600" />
          <span>
            This AI-generated analysis is provided as clinical decision support only, based on published research. Diagnostic and treatment decisions should be made by qualified healthcare professionals considering all clinical factors.
          </span>
        </div>

        <div className="mt-6 flex justify-center">
          <Button 
            onClick={generatePDF} 
            className="w-full md:w-auto"
            variant="default"
          >
            <Download size={16} className="mr-2" />
            Generate PDF Report
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ResultsDisplay;
