
import React from 'react';
import { X, Copy, Download } from 'lucide-react';

interface SummaryModalProps {
  summaryText: string;
  onClose: () => void;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ summaryText, onClose }) => {
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(summaryText)
      .then(() => {
        alert("Summary copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy summary: ', err);
        alert("Failed to copy summary. You can manually select and copy the text.");
      });
  };

  const handleDownloadAsText = () => {
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const today = new Date().toISOString().split('T')[0];
    link.download = `TrackWise_Summary_${today}.txt`; // Updated filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const summaryDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-40 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <header className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 id="summary-modal-title" className="text-lg font-semibold text-slate-800">
            Chat Summary for Your Reference
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"
            aria-label="Close summary modal"
          >
            <X size={22} />
          </button>
        </header>

        <div className="p-5 flex-grow overflow-y-auto custom-scrollbar bg-white">
          <p className="text-xs text-slate-500 mb-2">Summary generated on: {summaryDate}</p>
          <div 
            className="prose prose-sm max-w-none bg-slate-50 p-4 rounded-md whitespace-pre-wrap break-words text-slate-700 border border-slate-200"
            style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.6' }}
          >
            {summaryText}
          </div>
          <p className="mt-4 text-xs text-slate-600 italic">
            <strong>Disclaimer:</strong> This is an AI-generated summary of your conversation with TrackWise. It is intended for your personal reference to aid discussions with your healthcare or mental health provider and is not a substitute for professional medical or therapeutic advice, nor is it a medical record.
          </p>
        </div>

        <footer className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3 bg-slate-50">
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-md hover:from-sky-600 hover:to-sky-700 shadow-sm hover:shadow-md transition-all text-sm font-medium w-full sm:w-auto"
          >
            <Copy size={16} />
            Copy to Clipboard
          </button>
          <button
            onClick={handleDownloadAsText}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-md hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all text-sm font-medium w-full sm:w-auto"
          >
            <Download size={16} />
            Download as Text
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 hover:text-slate-800 transition-colors text-sm font-medium w-full sm:w-auto"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SummaryModal;