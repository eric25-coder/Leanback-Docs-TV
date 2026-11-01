import React, { useState } from 'react';
import { X, Moon, Sun, Monitor, HardDrive, Database, Shield, RotateCcw, Info, ArrowLeft, Palette, Settings } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...localSettings, ...patch };
    setLocalSettings(next);
    onSave(next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-300">
      {/* Settings Header */}
      <header className="flex items-center justify-between px-10 py-10 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <button
            onClick={onClose}
            className="p-4 bg-slate-800 hover:bg-blue-600 rounded-[20px] transition-all focus:ring-4 focus:ring-blue-500"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div>
            <h2 className="text-4xl font-extrabold text-white flex items-center gap-4">
              <Settings className="text-blue-400 w-10 h-10" /> Application Settings
            </h2>
            <p className="text-base text-slate-500 font-bold uppercase tracking-widest mt-2">Personalize Your TV Document Experience</p>
          </div>
        </div>
      </header>

      {/* Settings Grid */}
      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-12">
          {/* Appearance Section */}
          <section className="space-y-8 bg-slate-900/40 p-10 rounded-[40px] border border-white/5 shadow-2xl">
             <h3 className="text-xl font-extrabold text-white uppercase tracking-widest flex items-center gap-3 border-b border-white/5 pb-6">
               <Palette className="text-blue-500 w-6 h-6" /> Appearance
             </h3>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-950/40 p-6 rounded-3xl border border-white/5">
                   <div>
                      <h4 className="text-lg font-bold text-slate-200">System Theme</h4>
                      <p className="text-xs text-slate-500 uppercase font-mono mt-1">Light or Dark Mode Optimization</p>
                   </div>
                   <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5">
                      <button 
                        onClick={() => update({ theme: 'dark' })}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${localSettings.theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Dark
                      </button>
                      <button 
                        onClick={() => update({ theme: 'light' })}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${localSettings.theme === 'light' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Light
                      </button>
                   </div>
                </div>

                <div className="flex items-center justify-between bg-slate-950/40 p-6 rounded-3xl border border-white/5">
                   <div>
                      <h4 className="text-lg font-bold text-slate-200">Accent Color</h4>
                      <p className="text-xs text-slate-500 uppercase font-mono mt-1">Visual Branding Highlights</p>
                   </div>
                   <div className="flex gap-3">
                      {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'].map(color => (
                        <button 
                          key={color}
                          onClick={() => update({ accentColor: color })}
                          className={`w-10 h-10 rounded-full transition-all border-4 ${localSettings.accentColor === color ? 'border-white scale-110 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                   </div>
                </div>
             </div>
          </section>

          {/* Storage & Permissions Section */}
          <section className="space-y-8 bg-slate-900/40 p-10 rounded-[40px] border border-white/5 shadow-2xl">
             <h3 className="text-xl font-extrabold text-white uppercase tracking-widest flex items-center gap-3 border-b border-white/5 pb-6">
               <Shield className="text-emerald-500 w-6 h-6" /> Storage & Security
             </h3>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-950/40 p-6 rounded-3xl border border-white/5">
                   <div className="max-w-[70%]">
                      <h4 className="text-lg font-bold text-slate-200">Auto-Scan USB</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Automatically discover and list documents from connected media drives upon app startup.</p>
                   </div>
                   <button 
                     onClick={() => update({ autoScanUsb: !localSettings.autoScanUsb })}
                     className={`w-16 h-8 rounded-full transition-all relative ${localSettings.autoScanUsb ? 'bg-blue-600' : 'bg-slate-800 border border-white/5'}`}
                   >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${localSettings.autoScanUsb ? 'left-9 shadow-lg' : 'left-1'}`} />
                   </button>
                </div>

                <div className="flex items-center justify-between bg-slate-950/40 p-6 rounded-3xl border border-white/5">
                   <div className="max-w-[70%]">
                      <h4 className="text-lg font-bold text-slate-200">Remember Position</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Keep track of the last read page or cursor position for all your documents.</p>
                   </div>
                   <button 
                     onClick={() => update({ rememberPosition: !localSettings.rememberPosition })}
                     className={`w-16 h-8 rounded-full transition-all relative ${localSettings.rememberPosition ? 'bg-blue-600' : 'bg-slate-800 border border-white/5'}`}
                   >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${localSettings.rememberPosition ? 'left-9 shadow-lg' : 'left-1'}`} />
                   </button>
                </div>
             </div>
          </section>

          {/* System Info & Reset */}
          <section className="col-span-2 space-y-6">
             <div className="flex items-center gap-6">
                <button className="flex-1 p-8 bg-slate-900/60 rounded-[32px] border border-white/5 hover:bg-slate-800 transition-all text-left flex items-center gap-6 group">
                   <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner group-hover:scale-105 transition-transform">
                      <Database className="text-blue-500 w-8 h-8" />
                   </div>
                   <div>
                      <h4 className="text-xl font-extrabold text-white">Manage NAS Connections</h4>
                      <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Configure SMB/CIFS Network Shares</p>
                   </div>
                </button>

                <button 
                  onClick={() => { if(confirm('Reset all application data?')) window.location.reload(); }}
                  className="flex-1 p-8 bg-red-900/10 rounded-[32px] border border-red-500/10 hover:bg-red-900/20 transition-all text-left flex items-center gap-6 group"
                >
                   <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-inner group-hover:rotate-45 transition-transform duration-500">
                      <RotateCcw className="text-red-500 w-8 h-8" />
                   </div>
                   <div>
                      <h4 className="text-xl font-extrabold text-white">Reset Application</h4>
                      <p className="text-sm text-red-500/60 font-medium uppercase tracking-widest mt-1">Clear Cache, Notes and History</p>
                   </div>
                </button>
             </div>
          </section>
        </div>
      </main>

      {/* App Version Info */}
      <footer className="px-10 py-6 border-t border-white/5 bg-slate-900/20 flex items-center justify-center gap-3">
         <Info className="w-4 h-4 text-slate-600" />
         <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Leanback Docs TV • Build 2.4.01 • Production Stream</span>
      </footer>
    </div>
  );
};
