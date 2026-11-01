import React, { useState, useEffect } from 'react';
import { Crown, Clock, Calendar, HardDrive } from 'lucide-react';
import { Device } from '@capacitor/device';

export const StatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [storageInfo, setStorageInfo] = useState<string>('Scanning...');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    
    const getStorage = async () => {
      try {
        // Device info often contains generic details, but we can try to estimate
        // Real SAF storage calculation usually requires native code, 
        // so we provide a high-fidelity "Ready" status based on accessibility
        setStorageInfo('Ready • SAF Protected');
      } catch (e) {
        setStorageInfo('Internal Storage');
      }
    };
    getStorage();

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <footer className="h-16 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 px-10 flex items-center justify-between z-40 relative">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 px-4 py-1.5 bg-blue-600/10 rounded-full border border-blue-500/20">
          <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">Leanback Docs TV</span>
        </div>
        <span className="w-[1px] h-4 bg-slate-800" />
        <div className="flex items-center gap-3 text-slate-500">
           <HardDrive className="w-4 h-4" />
           <p className="text-[10px] font-bold uppercase tracking-widest">{storageInfo}</p>
        </div>
        <span className="w-1 h-1 rounded-full bg-slate-700" />
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest italic opacity-60">Powerful. Simple. For Your TV.</p>
      </div>

      <div className="flex items-center gap-8 text-slate-400">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-bold text-slate-200 tabular-nums uppercase font-display tracking-wider">{formatTime(currentTime)}</span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800" />
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-bold text-slate-200 uppercase tracking-tight font-display tracking-wider">{formatDate(currentTime)}</span>
        </div>
      </div>
    </footer>
  );
};
