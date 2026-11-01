import React, { useState } from 'react';
import { DocumentItem, PptxContent } from '../types';
import { Presentation, ChevronLeft, ChevronRight, Sparkles, ArrowLeft, MessageSquare } from 'lucide-react';

interface PowerPointViewerModalProps {
  doc: DocumentItem;
  onClose: () => void;
  onOpenAi: () => void;
}

export const PowerPointViewerModal: React.FC<PowerPointViewerModalProps> = ({ doc, onClose, onOpenAi }) => {
  const content = doc.content as PptxContent;
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [showNotes, setShowNotes] = useState(true);

  const slide = content.slides[currentSlideIdx] || content.slides[0] || { slideNumber: 1, title: 'No Content', bullets: [], notes: '' };

  // Remote D-pad support for slides
  React.useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCurrentSlideIdx(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setCurrentSlideIdx(i => Math.min(content.slides.length - 1, i + 1));
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [content.slides.length]);

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
              <Presentation className="w-5 h-5 text-amber-400" />
              {doc.title}
            </h2>
            <p className="text-xs text-slate-400">PowerPoint Deck (.pptx) · Slide {currentSlideIdx + 1} of {content.slides.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              showNotes ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Speaker Notes</span>
          </button>

          <button
            onClick={onOpenAi}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Presentation Summary</span>
          </button>
        </div>
      </div>

      {/* Main Slide Deck Canvas & Notes Split */}
      <div className="flex-1 overflow-y-auto p-10 flex gap-8 justify-center items-center bg-slate-950">
        <div className={`bg-gradient-to-br ${slide.backgroundTheme || 'from-slate-900 to-blue-950'} text-white rounded-3xl shadow-2xl p-16 w-full max-w-4xl aspect-[16/9] flex flex-col justify-between border border-slate-700/80`}>
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-white/10 pb-4">
            <span>{doc.title}</span>
            <span>Slide {slide.slideNumber} / {content.slides.length}</span>
          </div>

          <div className="my-auto space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              {slide.title}
            </h1>
            <ul className="space-y-3">
              {(slide.bullets || []).map((bullet: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-lg text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-2 shrink-0 shadow-lg shadow-amber-400/50" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-xs text-slate-400 font-mono pt-4 border-t border-white/10 flex justify-between">
            <span>Android TV 10-Foot Leanback Presentation</span>
            <span>Use D-Pad Left/Right to Navigate Slides</span>
          </div>
        </div>
      </div>

      {showNotes && (
        <div className="bg-slate-900 border-t border-slate-800 px-10 py-4 text-xs text-slate-300 flex items-center gap-4">
          <span className="font-bold text-amber-400 uppercase tracking-wider shrink-0">Speaker Notes:</span>
          <p className="italic text-slate-200 font-sans">{slide.notes}</p>
        </div>
      )}

      {/* Footer Navigation Bar */}
      <div className="py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-6">
        <button
          onClick={() => setCurrentSlideIdx((i) => Math.max(0, i - 1))}
          disabled={currentSlideIdx === 0}
          className="px-8 py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 rounded-[20px] text-sm font-bold flex items-center gap-3 transition-all outline-none focus-visible:ring-4 focus-visible:ring-blue-500"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous Slide</span>
        </button>

        <span className="text-lg font-bold text-slate-300 tabular-nums">
          Slide <span className="text-white">{currentSlideIdx + 1}</span> of {content.slides.length}
        </span>

        <button
          onClick={() => setCurrentSlideIdx((i) => Math.min(content.slides.length - 1, i + 1))}
          disabled={currentSlideIdx === content.slides.length - 1}
          className="px-8 py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 rounded-[20px] text-sm font-bold flex items-center gap-3 transition-all outline-none focus-visible:ring-4 focus-visible:ring-blue-500"
        >
          <span>Next Slide</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
