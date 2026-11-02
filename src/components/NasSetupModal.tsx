import React, { useState } from 'react';
import { Database, Shield, Globe, Server, CheckCircle2, X, RefreshCw, AlertCircle } from 'lucide-react';
import { NetworkConnection } from '../types';
import { getApiUrl } from '../utils/api';

interface NasSetupModalProps {
  onClose: () => void;
  onConnect: (conn: Omit<NetworkConnection, 'id' | 'status'>) => void;
}

export const NasSetupModal: React.FC<NasSetupModalProps> = ({ onClose, onConnect }) => {
  const [formData, setFormData] = useState({
    label: '',
    host: '',
    share: '',
    username: '',
    password: '',
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError(null);

    try {
      // Test the SMB connection through the proxy
      const response = await fetch(getApiUrl('/api/smb/list'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          share: `\\\\${formData.host}\\${formData.share}`,
          username: formData.username,
          password: formData.password
        })
      });

      if (response.ok) {
        onConnect(formData);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to connect to network share. Verify address and credentials.');
      }
    } catch (err: any) {
      setError('Network error. Ensure the server is accessible.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-white/10 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-10 py-8 bg-gradient-to-r from-teal-900/30 to-slate-900 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center border border-teal-500/30">
               <Database className="w-8 h-8 text-teal-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Add Network Storage</h2>
              <p className="text-teal-400/60 font-mono text-xs uppercase tracking-widest mt-1">NAS • SMB • WINDOWS SHARE</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl transition-all focus:ring-2 focus:ring-teal-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-10 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
              <p className="text-sm text-red-100/70 font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Device Label</label>
              <div className="relative group">
                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Work PC"
                  value={formData.label}
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Server Host/IP</label>
              <div className="relative group">
                <Server className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <input 
                  type="text" 
                  required
                  placeholder="192.168.1.100"
                  value={formData.host}
                  onChange={(e) => setFormData({...formData, host: e.target.value})}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3 col-span-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Shared Folder Name</label>
              <input 
                type="text" 
                required
                placeholder="Documents"
                value={formData.share}
                onChange={(e) => setFormData({...formData, share: e.target.value})}
                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <input 
                type="text" 
                placeholder="Guest"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              disabled={isConnecting}
              className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all focus:ring-4 focus:ring-teal-500/30 outline-none disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isConnecting}
              className="flex-1 py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold transition-all focus:ring-4 focus:ring-white shadow-lg shadow-teal-500/20 outline-none flex items-center justify-center gap-3 disabled:bg-teal-900"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Connect Server</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
