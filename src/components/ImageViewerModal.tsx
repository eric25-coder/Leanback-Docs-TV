import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { Image, ZoomIn, ZoomOut, Maximize, X, ArrowLeft, Download } from 'lucide-react';

interface ImageViewerModalProps {
  doc: DocumentItem;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ doc, onClose }) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-8 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 z-20">
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="p-3 bg-slate-800 hover:bg-blue-600 rounded-2xl transition-all focus:ring-4 focus:ring-blue-500"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Image className="text-blue-400 w-5 h-5" /> {doc.title}
            </h2>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Image Preview • {Math.round(zoom * 100)}% Zoom</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
            <button onClick={handleZoomOut} className="p-2.5 text-slate-400 hover:text-blue-400 transition-colors"><ZoomOut className="w-5 h-5" /></button>
            <button onClick={handleResetZoom} className="px-4 py-2 text-xs font-bold text-white hover:bg-white/5 rounded-xl transition-colors">Reset</button>
            <button onClick={handleZoomIn} className="p-2.5 text-slate-400 hover:text-blue-400 transition-colors"><ZoomIn className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Main Viewer Canvas */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-10 custom-scrollbar bg-[radial-gradient(circle_at_center,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]">
         <div 
           className="transition-transform duration-300 ease-out shadow-2xl"
           style={{ transform: `scale(${zoom})` }}
         >
           <img 
             src={`data:image/${doc.type};base64,${doc.content}`} 
             alt={doc.title}
             className="max-w-[90vw] max-h-[80vh] rounded-lg pointer-events-none"
           />
         </div>
      </div>

      {/* Remote Helper */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-2xl px-8 py-4 rounded-full border border-white/10 shadow-2xl z-30 pointer-events-none">
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
            Use Remote Pad to Nav
         </p>
      </div>
    </div>
  );
};
