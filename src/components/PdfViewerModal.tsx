import React, { useState, useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { DocumentItem } from '../types';
import { 
  FileText, ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Maximize, Minimize, Search, Sparkles, Download, Printer 
} from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerModalProps {
  doc: DocumentItem;
  onClose: () => void;
  onOpenAi: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ doc, onClose, onOpenAi }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [pdfData, setPdfData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let data: Uint8Array;
        if (typeof doc.content === 'string') {
          // If content is base64
          const binaryString = window.atob(doc.content);
          data = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            data[i] = binaryString.charCodeAt(i);
          }
        } else {
          throw new Error('Invalid PDF content format');
        }

        const loadingTask = pdfjs.getDocument({ data });
        const pdf = await loadingTask.promise;
        setPdfData(pdf);
        setNumPages(pdf.numPages);
        setIsLoading(false);
      } catch (err: any) {
        console.error('PDF load error:', err);
        setError(err.message || 'Failed to load PDF document');
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [doc.content]);

  useEffect(() => {
    if (pdfData && canvasRef.current) {
      renderPage(pageNumber);
    }
  }, [pdfData, pageNumber, scale]);

  const renderPage = async (num: number) => {
    try {
      const page = await pdfData.getPage(num);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Page render error:', err);
    }
  };

  const handlePrev = () => setPageNumber(p => Math.max(1, p - 1));
  const handleNext = () => setPageNumber(p => Math.min(numPages, p + 1));
  const zoomIn = () => setScale(s => Math.min(3, s + 0.2));
  const zoomOut = () => setScale(s => Math.max(0.5, s - 0.2));

  // Remote D-pad support for paging
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [numPages, pageNumber]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-white animate-in fade-in duration-300">
      {/* 1. Glass Top Toolbar */}
      <div className="flex items-center justify-between px-8 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 shadow-2xl z-20">
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="p-3 bg-slate-800 hover:bg-blue-600 rounded-2xl transition-all focus:ring-4 focus:ring-blue-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-3">
              <FileText className="text-red-400 w-5 h-5" /> {doc.title}
            </h2>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
              PDF Document • Page {pageNumber} of {numPages}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
            <button onClick={zoomOut} className="p-2.5 hover:text-blue-400 transition-colors"><ZoomOut className="w-5 h-5" /></button>
            <span className="text-xs font-bold w-12 text-center tabular-nums text-slate-400">{(scale * 100).toFixed(0)}%</span>
            <button onClick={zoomIn} className="p-2.5 hover:text-blue-400 transition-colors"><ZoomIn className="w-5 h-5" /></button>
          </div>
          
          <button 
            onClick={onOpenAi}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all focus:ring-4 focus:ring-white"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>AI Insights</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Paging Controls (Floating) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900/90 backdrop-blur-2xl px-8 py-4 rounded-[32px] border border-white/10 shadow-2xl z-30 transition-all hover:scale-105 group">
        <button 
          onClick={handlePrev} 
          disabled={pageNumber === 1}
          className="p-3 hover:bg-blue-600 rounded-full transition-all disabled:opacity-20 focus:ring-4 focus:ring-blue-500"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-2xl font-black tabular-nums tracking-tighter">{pageNumber} <span className="text-slate-600 font-medium">/</span> {numPages}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Paging</span>
        </div>
        <button 
          onClick={handleNext} 
          disabled={pageNumber === numPages}
          className="p-3 hover:bg-blue-600 rounded-full transition-all disabled:opacity-20 focus:ring-4 focus:ring-blue-500"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* 3. Main Viewer Area */}
      <div className="flex-1 overflow-auto bg-slate-950 flex justify-center p-10 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
             <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Rendering PDF Engine...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center space-y-4 max-w-md text-center">
             <FileText className="w-16 h-16 text-red-500 opacity-20" />
             <p className="text-lg font-bold text-white uppercase">{error}</p>
             <button onClick={onClose} className="px-6 py-3 bg-slate-800 rounded-2xl font-bold">Return to Library</button>
          </div>
        ) : (
          <div className="relative shadow-2xl shadow-black ring-1 ring-white/10 rounded-lg overflow-hidden">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
        )}
      </div>
    </div>
  );
};
