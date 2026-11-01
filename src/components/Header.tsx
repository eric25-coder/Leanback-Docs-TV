import React, { useState, useEffect } from 'react';
import { Tv, Wifi, WifiOff, Radio, Settings, Gamepad2 } from 'lucide-react';

interface HeaderProps {
  onRemoteClick: () => void;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRemoteClick,
  onSettingsClick,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="flex items-center justify-between px-10 py-8 bg-transparent z-40 relative">
      {/* Left: Branding */}
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] border border-white/20">
          <Tv className="w-10 h-10 text-white drop-shadow-lg" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 font-display">
            Leanback <span className="text-blue-400">Docs TV</span>
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-widest font-mono">Build 2.4</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-sm font-medium text-slate-400">Smart Document Ecosystem</span>
          </div>
        </div>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-6">
        {/* Connected Badge */}
        <div className={`flex items-center gap-4 px-6 py-3 rounded-full border border-white/5 shadow-inner transition-colors ${isOnline ? 'bg-slate-900/60' : 'bg-red-950/20'}`}>
          <div className="relative">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-emerald-400" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-500" />
            )}
            {isOnline && <div className="absolute inset-0 bg-emerald-400/20 blur-lg animate-pulse" />}
          </div>
          <div className="text-left">
            <p className={`text-[13px] font-bold leading-none ${isOnline ? 'text-emerald-400' : 'text-red-500'}`}>
              {isOnline ? 'Connected' : 'Offline Mode'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
              {isOnline ? 'Cloud AI Ready' : 'Local Access Only'}
            </p>
          </div>
        </div>

        {/* Remote Pad Button */}
        <button 
          onClick={onRemoteClick}
          className="flex items-center gap-3 bg-slate-800/80 hover:bg-blue-600 transition-all duration-300 px-6 py-3 rounded-2xl border border-white/10 group focus:ring-4 focus:ring-blue-500 focus:outline-none"
        >
          <Gamepad2 className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
          <span className="text-base font-bold text-white whitespace-nowrap">Remote Pad</span>
        </button>

        {/* Settings Circle */}
        <button 
          onClick={onSettingsClick}
          className="w-14 h-14 rounded-2xl bg-blue-900/40 hover:bg-blue-800/60 flex items-center justify-center border border-white/10 transition-all focus:ring-4 focus:ring-blue-500 focus:outline-none"
        >
          <Settings className="w-7 h-7 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
