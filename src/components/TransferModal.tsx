import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Computer, X, RefreshCw, Check } from 'lucide-react';

interface TransferModalProps {
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ onClose }) => {
  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('Generating connection...');

  useEffect(() => {
    // Generate QR code pointing to the server's transfer URL
    const url = `${import.meta.env.VITE_APP_URL || 'http://localhost:3000'}/upload-page`;
    QRCode.toDataURL(url).then(setQrCode).catch(console.error);
    setStatus('Ready to receive');
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-white/10 rounded-[40px] p-10 max-w-lg w-full shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-blue-500" /> Transfer Files
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex flex-col items-center gap-6">
          {qrCode ? (
            <img src={qrCode} alt="Transfer QR Code" className="bg-white p-4 rounded-2xl w-64 h-64" />
          ) : (
            <div className="w-64 h-64 bg-slate-800 rounded-2xl animate-pulse" />
          )}
          
          <div className="text-center">
            <p className="text-slate-300 font-bold mb-2">Scan with your phone or computer</p>
            <p className="text-sm text-slate-500">Ensure both devices are on the same Wi-Fi network.</p>
          </div>

          <div className="flex items-center gap-3 text-emerald-400 bg-emerald-950/30 px-6 py-3 rounded-full border border-emerald-500/30">
            <Check className="w-5 h-5" />
            <span className="text-sm font-bold">{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
