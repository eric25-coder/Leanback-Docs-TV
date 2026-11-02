import React from 'react';
import { DocumentItem } from '../types';
import { Table, Search, ArrowLeft, Sparkles } from 'lucide-react';

interface CsvViewerModalProps {
  doc: DocumentItem;
  onClose: () => void;
  onOpenAi: () => void;
}

export const CsvViewerModal: React.FC<CsvViewerModalProps> = ({ doc, onClose, onOpenAi }) => {
  // Parse CSV content (assuming comma separated)
  const rows = (doc.content as string || '').split('\n').map(line => line.split(','));
  const headers = rows[0] || [];
  const dataRows = rows.slice(1);

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
              <Table className="w-5 h-5 text-emerald-400" />
              {doc.title}
            </h2>
            <p className="text-xs text-slate-400">CSV Spreadsheet · {dataRows.length} records</p>
          </div>
        </div>

        <button
          onClick={onOpenAi}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <Sparkles className="w-4 h-4" />
          <span>Gemini Data Insight</span>
        </button>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 overflow-auto p-8 bg-slate-950 custom-scrollbar">
        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700">
                  <th className="p-4 w-12 text-center text-slate-400 border-r border-slate-200">#</th>
                  {headers.map((h, i) => (
                    <th key={i} className="p-4 border-r border-slate-200 font-bold uppercase tracking-wider min-w-[150px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm font-sans">
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-center text-xs font-mono text-slate-400 border-r border-slate-200 bg-slate-50/50">
                      {rIdx + 1}
                    </td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-4 border-r border-slate-200 text-slate-800 font-medium tabular-nums group-hover:text-blue-600">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
