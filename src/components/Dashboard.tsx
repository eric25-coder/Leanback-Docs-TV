import React from 'react';
import { FileText, Table, Presentation, FileCode, Play, ChevronRight, Usb, Folder, Database, Edit3, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { DocumentItem, RecentFile } from '../types';

interface DashboardProps {
  documents: DocumentItem[];
  recentFiles: RecentFile[];
  storageInfo: any;
  onNewDoc: () => void;
  onSelectCategory: (cat: string) => void;
  onSelectDoc: (id: string) => void;
  onFilterDocs: (type: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  documents, 
  recentFiles, 
  storageInfo,
  onNewDoc, 
  onSelectCategory,
  onSelectDoc,
  onFilterDocs
}) => {
  const stats = {
    total: documents.length,
    pdf: documents.filter(d => d.type === 'pdf').length,
    docx: documents.filter(d => d.type === 'docx').length,
    xlsx: documents.filter(d => d.type === 'xlsx').length,
    pptx: documents.filter(d => d.type === 'pptx').length,
  };

  const recentDocs = recentFiles
    .map(r => documents.find(d => d.id === r.docId))
    .filter(Boolean)
    .slice(0, 5) as DocumentItem[];

  return (
    <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-10 custom-scrollbar">
      {/* 1. Large Hero Section */}
      <section className="relative h-[480px] w-full rounded-[40px] overflow-hidden border border-white/10 group shadow-2xl shadow-blue-500/10">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-slate-900 to-transparent z-10" />
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center" />
        </div>

        {/* Floating Icons Visualization */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2 z-20 w-[400px] h-[300px]">
           <div className="relative w-full h-full">
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [-15, -12, -15] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-24 h-28 bg-red-600 rounded-2xl flex flex-col items-center justify-center shadow-2xl border border-white/20"
              >
                <FileText className="w-12 h-12 text-white" />
                <span className="text-[10px] font-bold text-white mt-1">PDF</span>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0], rotate: [-5, 0, -5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-4 left-32 w-24 h-28 bg-blue-600 rounded-2xl flex flex-col items-center justify-center shadow-2xl border border-white/20"
              >
                <div className="text-3xl font-black text-white">W</div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -15, 0], rotate: [10, 15, 10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-12 left-64 w-24 h-28 bg-emerald-600 rounded-2xl flex flex-col items-center justify-center shadow-2xl border border-white/20"
              >
                <div className="text-3xl font-black text-white">X</div>
              </motion.div>
           </div>
        </div>

        <div className="absolute inset-0 z-20 flex flex-col justify-center items-end text-right px-20">
          <div className="max-w-2xl">
            <div className="flex items-center justify-end gap-3 mb-6">
              <button 
                onClick={() => onFilterDocs('all')}
                className="bg-blue-600/20 backdrop-blur-xl px-5 py-2 rounded-full border border-blue-500/30 flex items-center gap-2 hover:bg-blue-600/40 transition-all outline-none focus:ring-2 focus:ring-white"
              >
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-bold text-blue-100 uppercase tracking-widest">
                  {stats.total} Documents Accessible
                </span>
              </button>
            </div>
            
            <h2 className="text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight font-display">
              View & Edit Any <br />
              <span className="text-blue-500">Document</span> Format
            </h2>
            
            <div className="flex flex-wrap justify-end gap-4 mb-10">
              {[
                { label: 'PDF', count: stats.pdf, color: 'text-red-400', id: 'pdf' },
                { label: 'Word', count: stats.docx, color: 'text-blue-400', id: 'word' },
                { label: 'Excel', count: stats.xlsx, color: 'text-emerald-400', id: 'excel' },
                { label: 'Slides', count: stats.pptx, color: 'text-amber-400', id: 'ppt' },
              ].map(stat => (
                <button 
                  key={stat.id}
                  onClick={() => onFilterDocs(stat.id)}
                  className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3 hover:border-blue-500/50 transition-all outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className={`text-xs font-black ${stat.color}`}>{stat.label}</span>
                  <span className="text-lg font-bold text-white">{stat.count}</span>
                </button>
              ))}
            </div>

            <div className="bg-slate-950/60 p-6 rounded-3xl border border-white/5 mb-10 w-[320px] ml-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Storage</span>
                <span className="text-xs font-mono text-blue-400">{storageInfo.freeFormatted} Free</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" 
                  style={{ width: `${storageInfo.percentUsed}%` }} 
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase">
                <span>Used: {storageInfo.percentUsed}%</span>
                <span>Total: {storageInfo.totalFormatted}</span>
              </div>
            </div>

            <button 
              onClick={onNewDoc}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  const sidebarActive = document.querySelector('aside button.bg-blue-600');
                  if (sidebarActive instanceof HTMLElement) sidebarActive.focus();
                }
              }}
              className="bg-blue-600 hover:bg-blue-500 transition-all duration-300 px-10 py-5 rounded-[24px] flex items-center gap-4 group outline-none focus-visible:ring-4 focus-visible:ring-white shadow-[0_20px_50px_rgba(37,99,235,0.4)] ml-auto"
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">Create New Note</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Featured Category Tiles */}
      <section className="grid grid-cols-4 gap-8">
        {[
          { id: 'usb', title: 'USB Drive', desc: 'Access your files', icon: Usb, color: 'from-blue-600 to-blue-900', shadow: 'shadow-blue-500/20' },
          { id: 'internal', title: 'Internal Storage', desc: 'Browse TV storage', icon: Folder, color: 'from-purple-600 to-indigo-900', shadow: 'shadow-purple-500/20' },
          { id: 'network', title: 'Network Storage', desc: 'Connect NAS', icon: Database, color: 'from-teal-600 to-slate-900', shadow: 'shadow-teal-500/20' },
          { id: 'edit', title: 'Edit Documents', desc: 'Create & modify', icon: Edit3, color: 'from-amber-500 to-orange-900', shadow: 'shadow-orange-500/20' },
        ].map((tile) => (
          <button
            key={tile.id}
            onClick={() => onSelectCategory(tile.id)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                // Focus the active sidebar item
                const sidebarActive = document.querySelector('aside button.bg-blue-600');
                if (sidebarActive instanceof HTMLElement) {
                  sidebarActive.focus();
                }
              }
            }}
            className={`relative p-8 rounded-[32px] bg-gradient-to-br ${tile.color} border border-white/10 text-left transition-all duration-300 hover:scale-[1.03] group outline-none focus-visible:ring-4 focus-visible:ring-white ${tile.shadow}`}
          >
            <div className="w-20 h-20 bg-black/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 shadow-inner">
               <tile.icon className="w-10 h-10 text-white opacity-90 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{tile.title}</h3>
                <p className="text-sm font-medium text-white/60 uppercase tracking-widest">{tile.desc}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </div>
          </button>
        ))}
      </section>

      {/* 3. Recent Files Section (New Functional Addition) */}
      {recentDocs.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-500" /> Recent Documents
            </h3>
            <button onClick={() => onSelectCategory('edit')} className="text-sm font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest">View All History</button>
          </div>
          <div className="grid grid-cols-5 gap-6">
            {recentDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 hover:bg-slate-800 transition-all group text-left focus:ring-4 focus:ring-blue-500 focus:outline-none"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                   {doc.type === 'pdf' ? <FileText className="text-red-400" /> : <FileText className="text-blue-400" />}
                </div>
                <h4 className="text-base font-bold text-white mb-1 truncate">{doc.title}</h4>
                <p className="text-xs text-slate-500 font-mono uppercase">{doc.updatedAt}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
