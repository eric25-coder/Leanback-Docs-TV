import React from 'react';
import { DocumentItem, DocxContent } from '../types';
import { FileText, Sparkles, ArrowLeft } from 'lucide-react';

interface WordViewerModalProps {
  doc: DocumentItem;
  onClose: () => void;
  onOpenAi: () => void;
}

export const WordViewerModal: React.FC<WordViewerModalProps> = ({ doc, onClose, onOpenAi }) => {
  const content = doc.content as DocxContent;

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
              <FileText className="w-5 h-5 text-blue-400" />
              {doc.title}
            </h2>
            <p className="text-xs text-slate-400">Word Document (.docx) · {content.paragraphs.length} sections</p>
          </div>
        </div>

        <button
          onClick={onOpenAi}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <Sparkles className="w-4 h-4" />
          <span>Gemini AI Assistant</span>
        </button>
      </div>

      {/* Main Document Viewer Canvas */}
      <div className="flex-1 overflow-y-auto p-12 flex justify-center items-start bg-slate-950">
        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-14 w-full max-w-3xl min-h-[700px] border border-slate-300">
          <div className="border-b border-slate-200 pb-4 mb-8 flex justify-between items-center text-xs text-slate-500 font-mono uppercase">
            <span>Author: {doc.author}</span>
            <span>Updated: {doc.updatedAt}</span>
          </div>

          <div className="space-y-6">
            {content.paragraphs.map((p: { id: string, type: string, text: string }) => {
              if (p.type === 'heading') {
                return (
                  <h3 key={p.id} className="text-2xl font-bold text-slate-900 mt-6 mb-3 tracking-tight">
                    {p.text}
                  </h3>
                );
              }
              if (p.type === 'bullet') {
                return (
                  <div key={p.id} className="flex items-start gap-3 pl-4">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <p className="text-slate-700 leading-relaxed text-base">{p.text}</p>
                  </div>
                );
              }
              return (
                <p key={p.id} className="text-slate-700 leading-relaxed text-base">
                  {p.text}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
