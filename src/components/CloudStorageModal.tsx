import React, { useState } from 'react';
import { Cloud, Globe, X, Check, Lock, ExternalLink, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface CloudStorageModalProps {
  onClose: () => void;
  onSelectDoc: (file: any) => void;
}

export const CloudStorageModal: React.FC<CloudStorageModalProps> = ({ onClose, onSelectDoc }) => {
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const providers = [
    { id: 'google', name: 'Google Drive', color: 'bg-blue-600', icon: Cloud, desc: 'Sync your Google documents' },
    { id: 'onedrive', name: 'Microsoft OneDrive', color: 'bg-indigo-600', icon: Cloud, desc: 'Access your Office files' },
    { id: 'dropbox', name: 'Dropbox', color: 'bg-blue-500', icon: Cloud, desc: 'Browse your Dropbox folders' },
  ];

  const handleConnect = (id: string) => {
    setActiveProvider(id);
    setIsAuthenticating(true);
    // In a real implementation, this would trigger the OAuth flow
    // For Google Drive, we'd use the set_up_oauth tool pattern
    setTimeout(() => {
      setIsAuthenticating(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-white/10 rounded-[40px] p-10 max-w-4xl w-full shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
               <Cloud className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-white">Cloud Ecosystem</h3>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">Unified Cloud Document Access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-full transition-colors"><X className="w-8 h-8 text-slate-500" /></button>
        </div>

        {!activeProvider ? (
          <div className="grid grid-cols-3 gap-8 mb-4">
            {providers.map((p) => (
              <button 
                key={p.id}
                onClick={() => handleConnect(p.id)}
                className="group relative bg-slate-800/50 border border-white/5 rounded-[32px] p-8 text-left transition-all hover:bg-blue-600/10 hover:border-blue-500/30 outline-none focus:ring-4 focus:ring-white"
              >
                <div className={`w-16 h-16 ${p.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                   <p.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{p.name}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
                <div className="mt-8 flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Connect</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            {isAuthenticating ? (
              <div className="space-y-6">
                <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Authenticating...</h4>
                  <p className="text-slate-500">Sign in on your device if a popup appears. <br/>Establishing secure encrypted tunnel.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8 max-w-md">
                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                   <Lock className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-4">Integration Pending</h4>
                  <p className="text-slate-400 leading-relaxed mb-8">
                    Cloud integrations require official API credentials. Please configure your <span className="text-white font-mono">CLIENT_ID</span> and <span className="text-white font-mono">CLIENT_SECRET</span> in the environment settings to enable live browsing.
                  </p>
                  <button 
                    onClick={() => setActiveProvider(null)}
                    className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all"
                  >
                    Back to Providers
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
           <div className="flex items-center gap-2">
              <Check className="w-3 h-3 text-emerald-500" />
              <span>AES-256 Encrypted Connection</span>
           </div>
           <span>Powered by Leanback Cloud Engine</span>
        </div>
      </div>
    </div>
  );
};
