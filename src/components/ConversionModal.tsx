import React, { useState } from 'react';
import { DocumentItem, DocumentType } from '../types';
import { RefreshCw, ArrowLeft, Check, Sparkles, FileText, ArrowRight } from 'lucide-react';

interface ConversionModalProps {
  documents: DocumentItem[];
  onClose: () => void;
  onConversionComplete: (newDoc: DocumentItem) => void;
}

export const ConversionModal: React.FC<ConversionModalProps> = ({
  documents,
  onClose,
  onConversionComplete,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [targetFormat, setTargetFormat] = useState<DocumentType>('pdf');
  const [converting, setConverting] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  const handleStartConversion = async () => {
    if (!selectedDoc) return;
    setConverting(true);
    setProgressPercent(10);
    setProgressStep('Reading document structure & layout...');

    setTimeout(() => {
      setProgressPercent(40);
      setProgressStep(`Parsing ${selectedDoc.type.toUpperCase()} streams...`);
    }, 600);

    setTimeout(() => {
      setProgressPercent(75);
      setProgressStep(`Generating target .${targetFormat.toUpperCase()} formatting...`);
    }, 1300);

    setTimeout(() => {
      setProgressPercent(100);
      setProgressStep('Conversion completed successfully!');
      setConverting(false);

      // Create converted document item
      const newTitle = selectedDoc.title.substring(0, selectedDoc.title.lastIndexOf('.')) || selectedDoc.title;
      const convertedDoc: DocumentItem = {
        id: `conv-${Date.now()}`,
        title: `${newTitle} (Converted.${targetFormat})`,
        type: targetFormat,
        size: selectedDoc.size,
        updatedAt: new Date().toISOString().split('T')[0],
        author: `${selectedDoc.author} [Converted]`,
        tags: ['Converted', targetFormat.toUpperCase()],
        isEditable: ['txt', 'md', 'json', 'csv', 'docx'].includes(targetFormat),
        content: selectedDoc.content,
        path: selectedDoc.path,
        source: selectedDoc.source,
      };

      setSuccessMessage(`Successfully converted to .${targetFormat.toUpperCase()}! Added to library.`);
      setTimeout(() => {
        onConversionComplete(convertedDoc);
      }, 1500);
    }, 2000);
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
              <RefreshCw className="w-5 h-5 text-purple-400" />
              Document Format Converter
            </h2>
            <p className="text-xs text-slate-400">Convert between PDF, DOCX, PPTX, XLSX & Text formats via Remote Control</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 max-w-2xl mx-auto w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          {successMessage ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">{successMessage}</h3>
              <p className="text-xs text-slate-400">Redirecting to your document library...</p>
            </div>
          ) : converting ? (
            <div className="py-10 space-y-6 text-center">
              <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Converting Document...</h3>
                <p className="text-xs font-mono text-purple-300">{progressStep}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs font-mono text-slate-400">{progressPercent}% Completed</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Select Document to Convert
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} (.{d.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center gap-4 py-4">
                <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono uppercase text-blue-400 font-bold">
                  .{selectedDoc?.type.toUpperCase()}
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500" />
                <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono uppercase text-purple-400 font-bold">
                  .{targetFormat.toUpperCase()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Target Format
                </label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as DocumentType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="pdf">PDF Document (.pdf)</option>
                  <option value="docx">Word Document (.docx)</option>
                  <option value="pptx">PowerPoint Presentation (.pptx)</option>
                  <option value="xlsx">Excel Spreadsheet (.xlsx)</option>
                  <option value="txt">Plain Text (.txt)</option>
                  <option value="md">Markdown (.md)</option>
                </select>
              </div>

              <button
                onClick={handleStartConversion}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Format Conversion</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
