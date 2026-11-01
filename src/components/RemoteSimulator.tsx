import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Home, ArrowLeft, Mic, Play, Pause, Volume2, RotateCcw } from 'lucide-react';

interface RemoteSimulatorProps {
  onDirection: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onSelect: () => void;
  onBack: () => void;
  onHome: () => void;
  onVoiceSearch: () => void;
  onClose?: () => void;
}

export const RemoteSimulator: React.FC<RemoteSimulatorProps> = ({
  onDirection,
  onSelect,
  onBack,
  onHome,
  onVoiceSearch,
  onClose,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-white w-72 flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-200">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-300">Android TV Remote</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
          >
            Minimize
          </button>
        )}
      </div>

      {/* D-Pad Navigation Ring */}
      <div className="relative w-44 h-44 bg-slate-800/80 rounded-full border border-slate-700 flex items-center justify-center my-2 shadow-inner">
        {/* Up */}
        <button
          onClick={() => onDirection('up')}
          className="absolute top-2 w-12 h-12 rounded-t-full bg-slate-700 hover:bg-blue-600 active:bg-blue-500 flex items-center justify-center transition-colors text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          title="D-Pad Up (Arrow Up)"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* Down */}
        <button
          onClick={() => onDirection('down')}
          className="absolute bottom-2 w-12 h-12 rounded-b-full bg-slate-700 hover:bg-blue-600 active:bg-blue-500 flex items-center justify-center transition-colors text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          title="D-Pad Down (Arrow Down)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Left */}
        <button
          onClick={() => onDirection('left')}
          className="absolute left-2 w-12 h-12 rounded-l-full bg-slate-700 hover:bg-blue-600 active:bg-blue-500 flex items-center justify-center transition-colors text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          title="D-Pad Left (Arrow Left)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right */}
        <button
          onClick={() => onDirection('right')}
          className="absolute right-2 w-12 h-12 rounded-r-full bg-slate-700 hover:bg-blue-600 active:bg-blue-500 flex items-center justify-center transition-colors text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          title="D-Pad Right (Arrow Right)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* OK / Select Center Button */}
        <button
          onClick={onSelect}
          className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 flex items-center justify-center font-bold text-sm tracking-wider shadow-lg shadow-blue-500/40 transition-transform active:scale-95 text-white focus:outline-none focus:ring-4 focus:ring-white"
          title="OK / Select (Enter)"
        >
          OK
        </button>
      </div>

      {/* Action Buttons Row */}
      <div className="w-full grid grid-cols-3 gap-2 mt-4">
        <button
          onClick={onBack}
          className="flex flex-col items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl transition-colors text-slate-300 hover:text-white text-[11px] font-medium"
          title="Back (Esc / Backspace)"
        >
          <ArrowLeft className="w-4 h-4 mb-1 text-blue-400" />
          <span>Back</span>
        </button>

        <button
          onClick={onHome}
          className="flex flex-col items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl transition-colors text-slate-300 hover:text-white text-[11px] font-medium"
          title="Home (H)"
        >
          <Home className="w-4 h-4 mb-1 text-emerald-400" />
          <span>Home</span>
        </button>

        <button
          onClick={onVoiceSearch}
          className="flex flex-col items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl transition-colors text-slate-300 hover:text-white text-[11px] font-medium"
          title="AI Voice Assistant / Mic"
        >
          <Mic className="w-4 h-4 mb-1 text-purple-400" />
          <span>AI Voice</span>
        </button>
      </div>

      <div className="mt-3 text-[10px] text-slate-400 text-center">
        Tip: You can also use keyboard Arrow Keys & Enter.
      </div>
    </div>
  );
};
