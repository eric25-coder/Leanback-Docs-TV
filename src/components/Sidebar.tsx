import React from 'react';
import { Home, FileText, Usb, Database, Clock, Search, Settings, Info, ChevronRight, Smartphone, Globe } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'usb', label: 'USB Drive', icon: Usb },
    { id: 'network', label: 'Network Storage', icon: Database },
    { id: 'cloud', label: 'Cloud Storage', icon: Globe },
    { id: 'recent', label: 'Recent Files', icon: Clock },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'transfer', label: 'Transfer Files', icon: Smartphone },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside className="w-80 h-full bg-slate-950/40 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 z-30">
      <nav className="flex-1 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  // Focus the first element in the main content area
                  const mainContent = document.querySelector('main button, main input, main [tabindex="0"]');
                  if (mainContent instanceof HTMLElement) {
                    mainContent.focus();
                  }
                }
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-blue-500 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 focus-visible:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent pointer-events-none" />
              )}
              <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors`} />
              <span className="text-lg font-semibold tracking-wide">{item.label}</span>
              {isActive && <ChevronRight className="w-5 h-5 ml-auto opacity-60" />}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="mt-auto pt-8 border-t border-white/5 px-4 pb-2">
        <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl p-4 border border-blue-500/20 relative overflow-hidden group">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)] group-hover:translate-x-10 transition-transform duration-1000" />
          <p className="text-[11px] font-mono text-blue-300 uppercase tracking-widest text-center italic">
            Read • Edit • Manage<br />Your Documents
          </p>
        </div>
      </div>
    </aside>
  );
};
