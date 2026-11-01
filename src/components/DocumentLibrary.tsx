import React, { useState, useMemo } from 'react';
import { DocumentItem, DocumentType } from '../types';
import { 
  FileText, Table, Presentation, FileCode, Search, Sparkles, Edit3, Eye, 
  Calendar, User, HardDrive, Plus, Trash2, MoreVertical, LayoutGrid, List,
  ArrowUpDown, Filter, Share2, Download, Folder
} from 'lucide-react';

interface DocumentLibraryProps {
  documents: DocumentItem[];
  initialFilter?: string;
  onSelectDoc: (id: string, mode: 'view' | 'edit') => void;
  onRenameDoc: (id: string, newName: string) => void;
  onDeleteDoc: (id: string) => void;
  onNewDocClick: () => void;
  onImportClick: () => void;
  onCreateFolder: (name: string) => void;
}

type SortKey = 'title' | 'date' | 'size';

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  initialFilter = 'all',
  onSelectDoc,
  onRenameDoc,
  onDeleteDoc,
  onNewDocClick,
  onImportClick,
  onCreateFolder,
}) => {
  const [filterType, setFilterType] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredDocs = useMemo(() => {
    return documents
      .filter((doc) => {
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
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortKey === 'title') comparison = a.title.localeCompare(b.title);
        if (sortKey === 'date') comparison = a.updatedAt.localeCompare(b.updatedAt);
        if (sortKey === 'size') comparison = (a.sizeBytes || 0) - (b.sizeBytes || 0);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [documents, filterType, searchQuery, sortKey, sortOrder]);

  const getDocIcon = (type: DocumentType) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-400" />;
      case 'docx': return <FileText className="w-8 h-8 text-blue-400" />;
      case 'xlsx': return <Table className="w-8 h-8 text-emerald-400" />;
      case 'pptx': return <Presentation className="w-8 h-8 text-amber-400" />;
      default: return <FileCode className="w-8 h-8 text-purple-400" />;
    }
  };

  const getBadgeColor = (type: DocumentType) => {
    switch (type) {
      case 'pdf': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'docx': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'xlsx': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'pptx': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-10 py-8 flex flex-col space-y-8 custom-scrollbar">
      {/* 1. Integrated Header Controls */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <h2 className="text-3xl font-extrabold text-white tracking-tight">Documents</h2>
           <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-slate-500 uppercase tracking-widest border border-white/5">
             {filteredDocs.length} Items Found
           </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  const sidebarActive = document.querySelector('aside button.bg-blue-600');
                  if (sidebarActive instanceof HTMLElement) sidebarActive.focus();
                }
              }}
              placeholder="Search documents, tags, or authors..."
              className="w-full bg-slate-900 border border-white/5 rounded-[20px] pl-14 pr-6 py-4 text-base text-white focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <button 
            onClick={() => setShowFolderModal(true)} 
            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-[20px] font-bold text-base border border-white/5 transition-all focus:ring-4 focus:ring-blue-500 active:scale-95 flex items-center gap-2"
          >
            <Folder className="w-5 h-5 text-purple-400" />
            <span className="hidden md:inline">Folder</span>
          </button>

          <button onClick={onNewDocClick} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[20px] font-bold text-base shadow-lg shadow-blue-500/20 flex items-center gap-3 transition-all focus:ring-4 focus:ring-white active:scale-95">
            <Plus className="w-5 h-5" /> New Note
          </button>
          
          <button onClick={onImportClick} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-[20px] font-bold text-base border border-white/5 transition-all focus:ring-4 focus:ring-blue-500 active:scale-95">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Advanced Toolbar */}
      <div className="flex items-center justify-between bg-slate-900/40 p-4 rounded-[28px] border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2 px-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'pdf', label: 'PDFs' },
            { id: 'word', label: 'Word' },
            { id: 'excel', label: 'Excel' },
            { id: 'ppt', label: 'Slides' },
            { id: 'text', label: 'Text' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-6 py-3 text-sm font-bold rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 px-2 shrink-0">
          <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-600 hover:text-slate-300'}`}
             >
               <LayoutGrid className="w-5 h-5" />
             </button>
             <button 
               onClick={() => setViewMode('list')}
               className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-600 hover:text-slate-300'}`}
             >
               <List className="w-5 h-5" />
             </button>
          </div>

          <button 
            onClick={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                const firstDoc = document.querySelector('.group[tabindex="0"]');
                if (firstDoc instanceof HTMLElement) firstDoc.focus();
              }
            }}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-400 hover:text-white transition-all bg-slate-950/50 rounded-2xl border border-white/5 focus:ring-2 focus:ring-blue-500"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Sort</span>
          </button>
        </div>
      </div>

      {/* 3. Responsive Content Display */}
      {filteredDocs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-32 opacity-40">
          <FileText className="w-20 h-20" />
          <p className="text-xl font-bold uppercase tracking-widest font-mono">No Documents Found</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-3 gap-8 pb-10" : "flex flex-col gap-4 pb-10"}>
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className={`group bg-slate-900/60 border border-white/5 hover:border-blue-500/40 rounded-[32px] transition-all duration-300 shadow-xl flex outline-none focus-within:ring-4 focus-within:ring-blue-500 focus-within:border-transparent ${viewMode === 'grid' ? 'p-8 flex-col' : 'p-6 items-center'}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSelectDoc(doc.id, 'view');
                if (e.key === 'ArrowLeft') {
                  const sidebarActive = document.querySelector('aside button.bg-blue-600');
                  if (sidebarActive instanceof HTMLElement) sidebarActive.focus();
                }
              }}
            >
              <div className={`flex items-start justify-between ${viewMode === 'grid' ? 'mb-8' : 'gap-6 flex-1'}`}>
                <div className={`flex items-center ${viewMode === 'grid' ? 'flex-col items-start gap-4' : 'gap-6'}`}>
                  <div className="w-16 h-16 rounded-[20px] bg-slate-950 flex items-center justify-center border border-white/5 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    {getDocIcon(doc.type)}
                  </div>
                  <div>
                    {editingId === doc.id ? (
                      <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => {
                          if (newName && newName !== doc.title) onRenameDoc(doc.id, newName);
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (newName && newName !== doc.title) onRenameDoc(doc.id, newName);
                            setEditingId(null);
                          }
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="bg-slate-950 border border-blue-500 text-white rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
                        {doc.title}
                      </h3>
                    )}
                    <div className="flex items-center gap-3 text-[13px] text-slate-500 font-mono">
                      <span className="uppercase">{doc.source}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span>{doc.size}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span>{doc.updatedAt}</span>
                    </div>
                  </div>
                </div>
                
                {viewMode === 'grid' && (
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase border tracking-tighter ${getBadgeColor(doc.type)}`}>
                    .{doc.type}
                  </span>
                )}
              </div>

              {viewMode === 'grid' && (
                <div className="flex flex-wrap gap-2 mb-10 overflow-hidden h-6">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">#{tag}</span>
                  ))}
                </div>
              )}

              <div className={`flex items-center gap-3 ${viewMode === 'grid' ? 'w-full' : 'shrink-0'}`}>
                <button
                  onClick={() => onSelectDoc(doc.id, 'view')}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] text-sm font-bold flex items-center justify-center gap-2 transition-all focus:ring-4 focus:ring-blue-500"
                >
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>View</span>
                </button>

                {doc.isEditable && (
                  <button
                    onClick={() => onSelectDoc(doc.id, 'edit')}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[18px] text-sm font-bold flex items-center justify-center gap-2 transition-all focus:ring-4 focus:ring-white shadow-lg shadow-blue-500/20"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}

                <button 
                  onClick={() => {
                    setEditingId(doc.id);
                    setNewName(doc.title);
                  }}
                  className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-[18px] border border-white/5 transition-all focus:ring-2 focus:ring-blue-500"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => setDeleteConfirmId(doc.id)}
                  className="p-4 bg-slate-950/40 hover:bg-red-950/40 hover:text-red-400 text-slate-600 rounded-[18px] border border-white/5 transition-all focus:ring-2 focus:ring-red-500 group/delete"
                >
                  <Trash2 className="w-4 h-4 group-hover/delete:animate-bounce" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Custom Modals for Restricted UI */}
      {showFolderModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[40px] p-10 max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Folder</h3>
            <input 
              autoFocus
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder name..."
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white mb-8 outline-none focus:ring-4 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (folderName) onCreateFolder(folderName);
                  setShowFolderModal(false);
                  setFolderName('');
                }
                if (e.key === 'Escape') setShowFolderModal(false);
              }}
            />
            <div className="flex gap-4">
               <button onClick={() => setShowFolderModal(false)} className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-bold">Cancel</button>
               <button 
                 onClick={() => {
                   if (folderName) onCreateFolder(folderName);
                   setShowFolderModal(false);
                   setFolderName('');
                 }}
                 className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold"
               >
                 Create
               </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl">
            <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-50" />
            <h3 className="text-2xl font-bold text-white mb-4">Delete Document?</h3>
            <p className="text-slate-400 mb-10">This action cannot be undone. Are you sure you want to remove this file?</p>
            <div className="flex gap-4">
               <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-bold">Keep File</button>
               <button 
                 onClick={() => {
                   onDeleteDoc(deleteConfirmId);
                   setDeleteConfirmId(null);
                 }}
                 className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold"
               >
                 Confirm Delete
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
