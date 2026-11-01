import React, { useState } from 'react';
import { DocumentItem, PdfContent } from '../types';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Sparkles, FileText, ArrowLeft } from 'lucide-react';

interface PdfViewerModalProps {
  doc: DocumentItem;
  onClose: () => void;
  onOpenAi: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ doc, onClose, onOpenAi }) => {
  const content = doc.content as PdfContent;
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  const page = content.pages.find((p) => p.pageNumber === currentPage) || content.pages[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col text-white animate-in fade-in duration-200">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-semibold">Back to Library</span>
          </button>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-400" />
              {doc.title}
            </h2>
            <p className="text-xs text-slate-400">PDF Document · Page {currentPage} of {content.totalPages}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setZoomLevel((z) => Math.max(75, z - 25))}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
            {zoomLevel}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(175, z + 25))}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAi}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gemini AI Summary</span>
          </button>
        </div>
      </div>

      {/* Main Document Viewer Canvas */}
      <div className="flex-1 overflow-y-auto p-12 flex justify-center items-start bg-slate-950">
        <div
          className="bg-white text-slate-900 rounded-2xl shadow-2xl p-12 transition-all duration-200 border border-slate-300"
          style={{ width: `${Math.min(900, 700 * (zoomLevel / 100))}px`, minHeight: '650px' }}
        >
          <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6 text-xs text-slate-500 uppercase tracking-wider font-mono">
            <span>{doc.title}</span>
            <span>Page {page.pageNumber} / {content.totalPages}</span>
          </div>

          <div className="prose prose-slate max-w-none text-slate-800 whitespace-pre-wrap leading-relaxed text-base font-sans">
            {page.text}
          </div>
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-6">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Page</span>
        </button>

        <span className="text-sm font-medium text-slate-300">
          Page {currentPage} of {content.totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(content.totalPages, p + 1))}
          disabled={currentPage === content.totalPages}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span>Next Page</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
