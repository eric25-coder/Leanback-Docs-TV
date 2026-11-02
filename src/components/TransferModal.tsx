import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Computer, X, RefreshCw, Check, FileText, Download, Play } from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface TransferModalProps {
  onClose: () => void;
  onOpenDoc: (filename: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ onClose, onOpenDoc }) => {
  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('Generating connection...');
  const [transfers, setTransfers] = useState<any[]>([]);

  useEffect(() => {
    // Generate QR code pointing to the server's upload page
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const url = `${baseUrl}/upload.html`;
    QRCode.toDataURL(url).then(setQrCode).catch(console.error);
    setStatus('Ready to receive');

    // Poll for new transfers every 3 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(getApiUrl('/api/transfers'));
        if (response.ok) {
          const data = await response.json();
          setTransfers(data.transfers || []);
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-white/10 rounded-[40px] p-12 max-w-4xl w-full shadow-2xl flex gap-12">
        {/* Left Side: Connection Info */}
        <div className="flex-1 flex flex-col items-center gap-8">
          <div className="text-center">
            <h3 className="text-3xl font-extrabold text-white flex items-center justify-center gap-3 mb-2">
              <Smartphone className="w-8 h-8 text-blue-500" /> Pairing
            </h3>
            <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Connect Phone or Computer</p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-blue-500/20 rounded-[48px] blur-2xl group-hover:bg-blue-500/30 transition-all" />
            {qrCode ? (
              <img src={qrCode} alt="Transfer QR Code" className="relative bg-white p-6 rounded-[40px] w-64 h-64 shadow-2xl" />
            ) : (
              <div className="relative w-64 h-64 bg-slate-800 rounded-[40px] animate-pulse" />
            )}
          </div>
          
          <div className="text-center">
            <p className="text-slate-300 font-bold text-lg mb-2">Scan to Upload</p>
            <p className="text-sm text-slate-500 max-w-[240px]">Ensure both devices are on the same local network for fast transfers.</p>
          </div>

          <div className="flex items-center gap-3 text-emerald-400 bg-emerald-950/30 px-6 py-3 rounded-full border border-emerald-500/30">
            <Check className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider">{status}</span>
          </div>
        </div>

        {/* Right Side: Incoming Files */}
        <div className="w-[440px] bg-slate-950/50 rounded-[40px] border border-white/5 flex flex-col p-8">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-bold text-white">Recent Incoming</h4>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-slate-500" /></button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {transfers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <Download className="w-12 h-12 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Waiting for files...</p>
              </div>
            ) : (
              transfers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((file) => (
                <div key={file.name} className="bg-slate-900 border border-white/5 p-5 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h5 className="text-white font-bold truncate max-w-[180px]">{file.name}</h5>
                      <p className="text-[10px] text-slate-500 uppercase font-mono tracking-tighter">{(file.size / 1024).toFixed(1)} KB • Just now</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onOpenDoc(file.name)}
                    className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-white"
                  >
                    <Play className="w-5 h-5 text-white fill-white" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center italic">Document ecosystem synchronized</p>
          </div>
        </div>
      </div>
    </div>
  );
};
