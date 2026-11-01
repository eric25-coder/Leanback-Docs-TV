import React, { useState } from 'react';
import { Plus, FileText, ArrowLeft } from 'lucide-react';
import { DocumentItem } from '../types';

interface NewNoteModalProps {
  onClose: () => void;
  onAddDoc: (doc: DocumentItem) => void;
}

export const NewNoteModal: React.FC<NewNoteModalProps> = ({ onClose, onAddDoc }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: title.endsWith('.txt') ? title : `${title}.txt`,
      type: 'txt',
      size: '2 KB',
      updatedAt: new Date().toISOString().split('T')[0],
      author: 'TV User',
      tags: ['Notes', 'Scratchpad'],
      isEditable: true,
      content: content || 'New scratchpad note created on Android TV.',
    };

    onAddDoc(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col text-white animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-semibold">Cancel</span>
          </button>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Create New Text Note
            </h2>
            <p className="text-xs text-slate-400">Fully Editable Text File for Android TV</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Note Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Living Room Meeting Ideas"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Note Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your notes here..."
              rows={8}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Save & Open Note</span>
          </button>
        </form>
      </div>
    </div>
  );
};
