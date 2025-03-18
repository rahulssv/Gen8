
import { ArrowLeft, Download } from 'lucide-react';

interface SummaryHeaderProps {
  onBack: () => void;
  onDownload: () => void;
  loading: boolean;
}

const SummaryHeader = ({ onBack, onDownload, loading }: SummaryHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onBack}
        className="flex items-center text-bioquery-600 hover:text-bioquery-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Results
      </button>
      
      <button
        onClick={onDownload}
        disabled={loading}
        className="button-transition flex items-center py-2 px-4 rounded-lg bg-bioquery-600 text-white font-medium hover:bg-bioquery-700 focus:outline-none focus:ring-2 focus:ring-bioquery-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Summary
      </button>
    </div>
  );
};

export default SummaryHeader;
