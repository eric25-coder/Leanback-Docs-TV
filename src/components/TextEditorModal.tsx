import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { FileCode, Save, Sparkles, ArrowLeft, Check, RefreshCw } from 'lucide-react';

interface TextEditorModalProps {
  doc: DocumentItem;
  onClose: () => void;
  onSave: (updatedContent: string) => void;
}

export const TextEditorModal: React.FC<TextEditorModalProps> = ({ doc, onClose, onSave }) => {
  const [textValue, setTextValue] = useState<string>(
    typeof doc.content === 'string' ? doc.content : JSON.stringify(doc.content, null, 2)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave(textValue);
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }, 400);
  };

  const runAiAssist = async (action: string) => {
    setAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/gemini/edit-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textValue, action }),
      });
      const data = await response.json();
      if (response.ok && data.result) {
        setTextValue(data.result);
      } else {
        setAiError(data.error || 'Failed to process AI assist');
      }
    } catch (err: any) {
      setAiError(err.message || 'Network error');
    } finally {
      setAiLoading(false);
    }
  };

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
              <FileCode className="w-5 h-5 text-emerald-400" />
              {doc.title} (Editable)
            </h2>
            <p className="text-xs text-slate-400">Format: .{doc.type} · Remote-Friendly TV Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <Check className="w-4 h-4" /> Saved Successfully
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* AI Assist Toolbar */}
      <div className="bg-slate-900/60 px-8 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Gemini AI Assist:
          </span>
          <button
            onClick={() => runAiAssist('proofread')}
            disabled={aiLoading}
            className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Proofread & Fix Grammar
          </button>
          <button
            onClick={() => runAiAssist('expand')}
            disabled={aiLoading}
            className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Expand Ideas
          </button>
          <button
            onClick={() => runAiAssist('summarize')}
            disabled={aiLoading}
            className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Summarize Text
          </button>
        </div>

        {aiLoading && (
          <span className="text-xs text-purple-300 flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing AI enhancement...
          </span>
        )}
        {aiError && <span className="text-xs text-red-400">{aiError}</span>}
      </div>

      {/* Main Text Editor Area */}
      <div className="flex-1 p-8 bg-slate-950 flex justify-center">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex justify-between items-center text-xs font-mono text-slate-400">
            <span>EDITOR MODE // .{doc.type.toUpperCase()}</span>
            <span>CHARACTERS: {textValue.length} · WORDS: {textValue.split(/\s+/).filter(Boolean).length}</span>
          </div>
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            className="flex-1 bg-transparent p-6 text-slate-100 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-0"
            placeholder="Type your document content or use remote input..."
            rows={20}
          />
        </div>
      </div>
    </div>
  );
};
