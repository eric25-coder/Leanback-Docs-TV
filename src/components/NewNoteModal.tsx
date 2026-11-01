import React, { useState } from 'react';
import { Plus, X, Save, Edit3, Type, ArrowLeft } from 'lucide-react';

interface NewNoteModalProps {
  onClose: () => void;
  onAddDoc: (title: string, content: string) => void;
}

export const NewNoteModal: React.FC<NewNoteModalProps> = ({ onClose, onAddDoc }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      onAddDoc(title, content);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Premium Header */}
      <header className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all focus:ring-4 focus:ring-blue-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Plus className="text-blue-400 w-8 h-8" /> Create New Note
            </h2>
            <p className="text-sm text-slate-500 uppercase tracking-[0.2em] font-mono mt-1">TV Document Workspace</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!title.trim() || !content.trim()}
          className="px-10 py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale text-white rounded-[24px] font-extrabold text-lg shadow-2xl shadow-blue-500/30 flex items-center gap-3 transition-all focus:ring-4 focus:ring-white active:scale-95"
        >
          <Save className="w-6 h-6" />
          <span>Save Document</span>
        </button>
      </header>

      {/* Workspace Area */}
      <main className="flex-1 flex flex-col p-10 max-w-6xl mx-auto w-full space-y-8">
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-xs font-black text-slate-600 uppercase tracking-widest px-4">
            <Type className="w-4 h-4" /> Document Title
          </label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title for your note..."
            className="w-full bg-slate-900/50 border border-white/5 rounded-[32px] px-10 py-8 text-4xl font-extrabold text-white focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all placeholder:text-slate-800"
          />
        </div>

        <div className="flex-1 flex flex-col space-y-4">
          <label className="flex items-center gap-3 text-xs font-black text-slate-600 uppercase tracking-widest px-4">
            <Edit3 className="w-4 h-4" /> Content Body
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your thoughts here... Optimized for remote keyboard input."
            className="flex-1 w-full bg-slate-900/50 border border-white/5 rounded-[40px] px-10 py-10 text-xl leading-relaxed text-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all placeholder:text-slate-800 resize-none custom-scrollbar"
          />
        </div>
      </main>

      {/* Keyboard Shortcuts Hint */}
      <footer className="px-10 py-6 border-t border-white/5 bg-slate-900/20 text-center">
         <p className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center justify-center gap-6">
            <span className="flex items-center gap-2"><span className="px-2 py-1 bg-slate-800 rounded border border-white/5">BACK</span> To Cancel</span>
            <span className="flex items-center gap-2"><span className="px-2 py-1 bg-slate-800 rounded border border-white/5">ENTER</span> To Focus Text</span>
         </p>
      </footer>
    </div>
  );
};
