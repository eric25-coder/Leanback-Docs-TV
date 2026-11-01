import React from 'react';
import { Tv, Sliders, Plus, Sparkles, Radio } from 'lucide-react';
import { ActiveModal } from '../types';

interface HeaderProps {
  activeModal: ActiveModal;
  setActiveModal: (modal: ActiveModal) => void;
  onNewDocClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModal,
  setActiveModal,
  onNewDocClick,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-8 py-5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      {/* Zone 1: Brand Wordmark */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setActiveModal({ type: 'library' })}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
          <Tv className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Leanback Docs TV
          </span>
          <span className="block text-[10px] text-blue-400 font-mono tracking-widest uppercase">
            Android TV v2.4 (Auto Storage)
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveModal({ type: 'library' })}
          className={`hover:text-white transition-colors py-1 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            activeModal.type === 'library' ? 'bg-slate-800 text-white font-semibold' : ''
          }`}
        >
          Document Library
        </button>
        <button
          onClick={() => setActiveModal({ type: 'convert' } as any)}
          className={`hover:text-white transition-colors py-1 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1.5 ${
            (activeModal as any).type === 'convert' ? 'bg-slate-800 text-white font-semibold' : ''
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          Convert Format
        </button>
        <button
          onClick={() => setActiveModal({ type: 'remote' })}
          className={`hover:text-white transition-colors py-1 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1.5 ${
            activeModal.type === 'remote' ? 'bg-slate-800 text-white font-semibold' : ''
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          Virtual Remote
        </button>
        <button
          onClick={() => setActiveModal({ type: 'settings' })}
          className={`hover:text-white transition-colors py-1 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            activeModal.type === 'settings' ? 'bg-slate-800 text-white font-semibold' : ''
          }`}
        >
          TV Settings
        </button>
      </nav>

      {/* Zone 3: Primary Action & Quick Tools */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveModal({ type: 'remote' })}
          className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700/80 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          title="Open Virtual Remote Control"
        >
          <Radio className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Remote Pad</span>
        </button>

        <button
          onClick={onNewDocClick}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
};
