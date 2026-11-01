import React from 'react';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Circle, 
  ChevronLeft, Home, Mic, Play, Pause, X 
} from 'lucide-react';

interface RemoteSimulatorProps {
  onDirection: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onSelect: () => void;
  onBack: () => void;
  onHome: () => void;
  onVoiceSearch?: () => void;
  onClose: () => void;
}

export const RemoteSimulator: React.FC<RemoteSimulatorProps> = ({
  onDirection,
  onSelect,
  onBack,
  onHome,
  onVoiceSearch,
  onClose,
}) => {
  const triggerNativeEvent = (key: string) => {
     // Simulate physical keyboard events that our app listeners catch
     window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-[60px] p-10 w-96 shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-in zoom-in duration-300 relative">
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-red-500 rounded-full transition-colors text-slate-500 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center gap-12">
        {/* Voice Search Circle */}
        <button 
          onClick={() => { onVoiceSearch?.(); triggerNativeEvent('v'); }}
          className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] border-4 border-blue-400 hover:scale-110 transition-transform active:scale-95 group focus:ring-4 focus:ring-white"
        >
          <Mic className="w-8 h-8 text-white animate-pulse group-hover:scale-125 transition-transform" />
        </button>

        {/* D-Pad Container */}
        <div className="relative w-64 h-64 bg-slate-800 rounded-full shadow-inner border border-white/5 p-4">
           {/* Center OK Button */}
           <button 
             onClick={() => { onSelect(); triggerNativeEvent('Enter'); }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-slate-950 rounded-full border-4 border-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors active:scale-90 shadow-2xl focus:ring-4 focus:ring-blue-500 focus:outline-none"
           >
              <span className="text-xl font-black text-white">OK</span>
           </button>

           {/* Directional Buttons */}
           <button 
             onClick={() => { onDirection('up'); triggerNativeEvent('ArrowUp'); }}
             className="absolute top-4 left-1/2 -translate-x-1/2 p-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
           >
             <ArrowUp className="w-8 h-8" />
           </button>
           <button 
             onClick={() => { onDirection('down'); triggerNativeEvent('ArrowDown'); }}
             className="absolute bottom-4 left-1/2 -translate-x-1/2 p-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
           >
             <ArrowDown className="w-8 h-8" />
           </button>
           <button 
             onClick={() => { onDirection('left'); triggerNativeEvent('ArrowLeft'); }}
             className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
           >
             <ArrowLeft className="w-8 h-8" />
           </button>
           <button 
             onClick={() => { onDirection('right'); triggerNativeEvent('ArrowRight'); }}
             className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
           >
             <ArrowRight className="w-8 h-8" />
           </button>
        </div>

        {/* Function Row */}
        <div className="flex items-center gap-6 w-full justify-center">
           <button 
             onClick={() => { onBack(); triggerNativeEvent('Backspace'); }}
             className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border border-white/5 hover:bg-slate-700 transition-colors focus:ring-4 focus:ring-blue-500"
           >
              <ChevronLeft className="w-8 h-8 text-white" />
           </button>
           <button 
             onClick={() => { onHome(); triggerNativeEvent('h'); }}
             className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border border-white/5 hover:bg-slate-700 transition-colors focus:ring-4 focus:ring-blue-500"
           >
              <Home className="w-8 h-8 text-white" />
           </button>
           <div className="flex flex-col gap-2">
              <button className="w-16 h-10 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/5 hover:bg-slate-700 transition-colors">
                <Play className="w-4 h-4 text-white fill-white" />
              </button>
              <button className="w-16 h-10 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/5 hover:bg-slate-700 transition-colors">
                <Pause className="w-4 h-4 text-white fill-white" />
              </button>
           </div>
        </div>
      </div>

      <div className="mt-12 text-center">
         <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Android TV Virtual Pad</p>
      </div>
    </div>
  );
};
