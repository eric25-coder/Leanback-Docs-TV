import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { Sparkles, Send, ArrowLeft, Bot, User, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface AiAssistantModalProps {
  doc: DocumentItem;
  onClose: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ doc, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Hello! I am your Gemini AI document copilot for "${doc.title}". Ask me any question or request a summary of this document.`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/gemini/qa'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: doc.title,
          documentType: doc.type,
          content: doc.content,
          question: userText,
        }),
      });
      const data = await response.json();
      if (response.ok && data.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', text: `Error: ${data.error || 'Failed to get answer.'}` }]);
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', text: `Network error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = async (promptText: string) => {
    setInputQuery(promptText);
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
            <span className="text-xs font-semibold">Back to Viewer</span>
          </button>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Gemini AI Document Copilot
            </h2>
            <p className="text-xs text-slate-400">Context: {doc.title}</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
              }`}
            >
              {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div
              className={`max-w-xl p-5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none shadow-xl'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-sm text-slate-300 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> Gemini is analyzing document & thinking...
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts & Input */}
      <div className="bg-slate-900 border-t border-slate-800 p-6 flex flex-col gap-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Suggested:</span>
          <button
            onClick={() => handleQuickPrompt('Give me a 3-bullet executive summary of this document.')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-200 border border-slate-700 whitespace-nowrap"
          >
            ✨ Executive Summary
          </button>
          <button
            onClick={() => handleQuickPrompt('What are the key action items or main takeaways?')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-200 border border-slate-700 whitespace-nowrap"
          >
            📋 Key Takeaways
          </button>
          <button
            onClick={() => handleQuickPrompt('Explain this document in simple terms for TV viewers.')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-200 border border-slate-700 whitespace-nowrap"
          >
            📺 Simplify for TV
          </button>
        </div>

        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about this document..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
