import React from 'react';
import { Sliders, Tv, Volume2, Shield, Sparkles, ArrowLeft } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
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
              <Sliders className="w-5 h-5 text-blue-400" />
              Android TV Preferences & Settings
            </h2>
            <p className="text-xs text-slate-400">Leanback UI & Remote Navigation Configuration</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 max-w-4xl mx-auto w-full space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <Tv className="w-5 h-5 text-blue-400" /> 10-Foot Leanback Display Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">High Contrast Focus Rings</h4>
                <p className="text-xs text-slate-400">Enhance D-pad visibility with glowing rings</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 rounded cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">TV Sound Effects</h4>
                <p className="text-xs text-slate-400">Play navigation audio feedback clicks</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 rounded cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">Large Font Scale (1.25x)</h4>
                <p className="text-xs text-slate-400">Optimized for living room viewing distance</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 rounded cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">Gemini AI Assistant</h4>
                <p className="text-xs text-slate-400">Server-side generative AI integration</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-mono font-bold border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <Shield className="w-5 h-5 text-emerald-400" /> System & Version Info
          </h3>
          <div className="text-xs font-mono text-slate-400 space-y-2">
            <p>App Package: com.leanback.docs.tv</p>
            <p>Framework: React 19 + TypeScript + Vite + Tailwind v4</p>
            <p>AI Engine: Google Gemini SDK (@google/genai)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
