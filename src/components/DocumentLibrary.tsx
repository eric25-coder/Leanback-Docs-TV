import React, { useState } from 'react';
import { DocumentItem, DocumentType } from '../types';
import { FileText, Table, Presentation, FileCode, Search, Sparkles, Edit3, Eye, Calendar, User, HardDrive, Plus } from 'lucide-react';

interface DocumentLibraryProps {
  documents: DocumentItem[];
  onSelectDoc: (id: string, mode: 'view' | 'edit') => void;
  onNewDocClick: () => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  onSelectDoc,
  onNewDocClick,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      filterType === 'all' ||
      (filterType === 'pdf' && doc.type === 'pdf') ||
      (filterType === 'word' && doc.type === 'docx') ||
      (filterType === 'excel' && doc.type === 'xlsx') ||
      (filterType === 'ppt' && doc.type === 'pptx') ||
      (filterType === 'text' && ['txt', 'md', 'json', 'csv'].includes(doc.type));

    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const getDocIcon = (type: DocumentType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-400" />;
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-400" />;
      case 'xlsx':
        return <Table className="w-8 h-8 text-emerald-400" />;
      case 'pptx':
        return <Presentation className="w-8 h-8 text-amber-400" />;
      default:
        return <FileCode className="w-8 h-8 text-purple-400" />;
    }
  };

  const getBadgeColor = (type: DocumentType) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'docx':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'xlsx':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'pptx':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-12 py-10 max-w-7xl mx-auto w-full">
      {/* Hero Welcome Banner */}
      <div className="mb-10 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5" /> Automatic TV & USB Storage Connected
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            View & Edit Any Document Format
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Files from connected USB media drives, internal TV storage, and NAS shares are mounted and displayed automatically upon startup.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNewDocClick}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Note</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'pdf', label: 'PDF Documents' },
            { id: 'word', label: 'Word (.docx)' },
            { id: 'excel', label: 'Excel (.xlsx)' },
            { id: 'ppt', label: 'PowerPoint (.pptx)' },
            { id: 'text', label: 'Text & Code' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-24 bg-slate-900/50 rounded-3xl border border-slate-800">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No documents found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="group bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-3xl p-6 transition-all duration-200 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
              tabIndex={0}
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0 shadow-inner">
                    {getDocIcon(doc.type)}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase border ${getBadgeColor(doc.type)}`}>
                    .{doc.type}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {doc.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 font-mono">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> {doc.author}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {doc.updatedAt}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[10px] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onSelectDoc(doc.id, 'view')}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>View</span>
                </button>

                {doc.isEditable && (
                  <button
                    onClick={() => onSelectDoc(doc.id, 'edit')}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
