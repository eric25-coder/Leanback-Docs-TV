import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Directory } from '@capacitor/filesystem';
import { DocumentItem, ActiveModal, DocumentType, UserNote, AppSettings, NetworkConnection, RecentFile } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StatusBar } from './components/StatusBar';
import { DocumentLibrary } from './components/DocumentLibrary';
import { PdfViewerModal } from './components/PdfViewerModal';
import { WordViewerModal } from './components/WordViewerModal';
import { ExcelViewerModal } from './components/ExcelViewerModal';
import { PowerPointViewerModal } from './components/PowerPointViewerModal';
import { TextEditorModal } from './components/TextEditorModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { SettingsModal } from './components/SettingsModal';
import { NewNoteModal } from './components/NewNoteModal';
import { RemoteSimulator } from './components/RemoteSimulator';
import { ImageViewerModal } from './components/ImageViewerModal';
import { CsvViewerModal } from './components/CsvViewerModal';
import { TransferModal } from './components/TransferModal';
import { CloudStorageModal } from './components/CloudStorageModal';
import { NasSetupModal } from './components/NasSetupModal';
import { Info, Tv } from 'lucide-react';

// Services
import { db } from './services/db';
import { fs } from './services/fs';
import { docParser } from './services/docParser';

export default function App() {
  // State
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [nasConnections, setNasConnections] = useState<NetworkConnection[]>([]);
  const [activeModal, setActiveModal] = useState<ActiveModal>({ type: 'library' });
  const [activeTab, setActiveTab] = useState<string>('home');
  const [docFilter, setDocFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>({ freeFormatted: '12.4 GB', totalFormatted: '32.0 GB', percentUsed: 38 });

  // Load Initial Data
  useEffect(() => {
    const init = async () => {
      console.log('[STARTUP] Starting initialization sequence...');
      
      // Safety timeout: force loading screen to hide after 10 seconds
      const safetyTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn('[STARTUP] Safety timeout triggered - forcing initialization completion');
          setIsLoading(false);
          setInitError('Initialization is taking longer than expected. Some features may be limited.');
        }
      }, 10000);

      try {
        console.log('[STARTUP] Loading database records...');
        const [savedSettings, savedRecent, savedNotes, savedNas] = await Promise.all([
          db.getSettings().catch(e => { console.error('[STARTUP] Settings load fail:', e); return null; }),
          db.getRecentFiles().catch(e => { console.error('[STARTUP] Recent files load fail:', e); return []; }),
          db.getNotes().catch(e => { console.error('[STARTUP] Notes load fail:', e); return []; }),
          db.getNasConnections().catch(e => { console.error('[STARTUP] NAS load fail:', e); return []; })
        ]);

        console.log('[STARTUP] Database records loaded successfully');
        if (savedSettings) setSettings(savedSettings);
        setRecentFiles(savedRecent);
        setNotes(savedNotes);
        setNasConnections(savedNas);
        
        // Initial File Scan
        try {
          console.log('[STARTUP] Checking filesystem permissions...');
          await fs.checkPermissions();
          console.log('[STARTUP] Scanning for files...');
          await refreshFiles();
          console.log('[STARTUP] Filesystem scan complete');
        } catch (fsErr) {
          console.warn('[STARTUP] Initial file scan failed, likely permission denied:', fsErr);
        }
      } catch (error: any) {
        console.error('[STARTUP] CRITICAL INIT ERROR:', error);
        setInitError(error?.message || 'Failed to initialize application data.');
      } finally {
        clearTimeout(safetyTimeout);
        console.log('[STARTUP] Initialization sequence finished');
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const refreshFiles = async () => {
    const internalFiles = await fs.listFiles('', Directory.Documents);
    
    let usbFiles: DocumentItem[] = [];
    try {
      usbFiles = await fs.listFiles('', Directory.External);
    } catch (e) {}

    // Fetch Transferred Files
    let transferFiles: DocumentItem[] = [];
    try {
      const response = await fetch(getApiUrl('/api/transfers'));
      if (response.ok) {
        const data = await response.json();
        transferFiles = (data.transfers || []).map((f: any) => ({
          id: `transfer-${f.name}`,
          title: f.name,
          type: f.name.split('.').pop()?.toLowerCase() as DocumentType || 'txt',
          size: `${(f.size / 1024).toFixed(1)} KB`,
          updatedAt: new Date(f.createdAt).toISOString().split('T')[0],
          author: 'Remote User',
          tags: ['Transferred'],
          isEditable: ['txt', 'md'].includes(f.name.split('.').pop()?.toLowerCase()),
          path: f.name,
          source: 'internal', // Treat as internal for viewing logic since it's on the server uploads dir
        }));
      }
    } catch (e) {}

    // Map notes to documents too
    const noteDocs: DocumentItem[] = notes.map(n => ({
      id: `note-${n.id}`,
      title: n.title,
      type: 'txt',
      size: `${(new Blob([n.content]).size / 1024).toFixed(1)} KB`,
      updatedAt: n.updatedAt,
      author: 'User',
      tags: ['Note'],
      isEditable: true,
      path: n.id,
      source: 'app',
    }));

    setDocuments([...noteDocs, ...internalFiles, ...usbFiles, ...transferFiles]);
    
    // Refresh storage info
    try {
      const info = await fs.getStorageInfo();
      setStorageInfo(info);
    } catch (e) {}
  };

  const handleSelectDoc = async (id: string, mode: 'view' | 'edit') => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    // Log to recent
    await db.addRecentFile(id);
    const updatedRecent = await db.getRecentFiles();
    setRecentFiles(updatedRecent);

    // If it's a real file (not a note), we might need to load its content if not already there
    if (doc.source !== 'app' && !doc.content) {
      try {
        const directory = doc.source === 'usb' ? Directory.External : Directory.Documents;
        const isBinary = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(doc.type);
        const data = await fs.readFile(doc.path, directory, isBinary);
        
        if (doc.type === 'docx') {
          doc.content = await docParser.parseDocx(data);
        } else if (doc.type === 'doc') {
          doc.content = await docParser.parseDoc(data);
        } else if (doc.type === 'xlsx' || doc.type === 'xls') {
          doc.content = await docParser.parseXlsx(data);
        } else if (doc.type === 'ppt') {
          doc.content = await docParser.parsePpt(data);
        } else {
          doc.content = data;
        }
      } catch (e) {
        console.error('Failed to load file content:', e);
      }
    } else if (doc.source === 'app') {
      const note = notes.find(n => n.id === doc.path);
      if (note) doc.content = note.content;
    }

    if (mode === 'edit') {
      setActiveModal({ type: 'editor', docId: id });
    } else {
      setActiveModal({ type: 'viewer', docId: id });
    }
  };

  const handleSaveDocContent = async (docId: string, updatedContent: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    if (doc.source === 'app') {
      const noteId = doc.path;
      const existingNote = notes.find(n => n.id === noteId);
      if (existingNote) {
        const updatedNote = { ...existingNote, content: updatedContent, updatedAt: new Date().toISOString().split('T')[0] };
        await db.saveNote(updatedNote);
        setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));
      }
    } else {
      const directory = doc.source === 'usb' ? Directory.External : Directory.Documents;
      await fs.writeFile(doc.path, updatedContent, directory);
    }
    
    await refreshFiles();
  };

  const handleAddNote = async (title: string, content: string) => {
    const newNote: UserNote = {
      id: `note-${Date.now()}`,
      title,
      content,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    await db.saveNote(newNote);
    setNotes(prev => [newNote, ...prev]);
    await refreshFiles();
    setActiveModal({ type: 'library' });
    setActiveTab('documents');
  };
  
  const handleRenameDoc = async (id: string, newName: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const directory = doc.source === 'usb' ? Directory.External : Directory.Documents;
    await fs.renameFile(doc.path, newName, directory);
    await refreshFiles();
  };

  const handleDeleteDoc = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const directory = doc.source === 'usb' ? Directory.External : Directory.Documents;
    await fs.deleteFile(doc.path, directory);
    await refreshFiles();
  };

  const handleCreateFolder = async (name: string) => {
    await fs.createFolder(name, Directory.Documents);
    await refreshFiles();
  };

  const handleFilterDocs = (filter: string) => {
    setDocFilter(filter);
    setActiveTab('documents');
  };

  const handleNativeFilePick = async () => {
    try {
      const result = await FilePicker.pickFiles({ readData: true });
      if (result.files.length > 0) {
        const file = result.files[0];
        const ext = file.name.split('.').pop()?.toLowerCase() as DocumentType || 'txt';
        
        // Save to internal Documents directory for persistence if desired, or just use SAF URI
        // Here we just add to our memory list for the session
        const newDoc: DocumentItem = {
          id: `saf-${Date.now()}`,
          title: file.name,
          type: ext,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          updatedAt: new Date().toISOString().split('T')[0],
          author: 'Native Storage',
          tags: ['Imported', ext.toUpperCase()],
          isEditable: ['txt', 'md', 'json', 'csv'].includes(ext),
          path: file.path || '',
          source: 'internal',
          content: file.data
        };
        setDocuments(prev => [newDoc, ...prev]);
        setActiveModal({ type: 'viewer', docId: newDoc.id });
      }
    } catch (err) {
      console.error('File pick error:', err);
    }
  };

  // Keyboard Navigation & Focus Management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('[REMOTE] Key pressed:', e.key);
      
      // Android TV Back / Escape logic
      if (e.key === 'Escape' || e.key === 'Backspace') {
        // If an editor or viewer is open, close it
        if (activeModal.type === 'viewer' || activeModal.type === 'editor' || activeModal.type === 'ai_copilot') {
          e.preventDefault();
          setActiveModal({ type: 'library' });
          return;
        }

        // If other sub-modals are open
        if (activeModal.type !== 'library') {
          e.preventDefault();
          setActiveModal({ type: 'library' });
          return;
        }

        // If in a sub-section but not Home, return to Home
        if (activeTab !== 'home') {
          e.preventDefault();
          setActiveTab('home');
          return;
        }

        // If on Home and no modal, show exit confirm
        if (activeTab === 'home' && activeModal.type === 'library' && !showExitConfirm) {
          e.preventDefault();
          setShowExitConfirm(true);
          return;
        }
        
        if (showExitConfirm) {
          e.preventDefault();
          setShowExitConfirm(false);
          return;
        }
      } 
      
      // Home Key (Mapping 'h' as a fallback or actual Home key if mapped)
      if (e.key === 'h' || e.key === 'H' || e.key === 'Home') {
        setActiveTab('home');
        setActiveModal({ type: 'library' });
        setShowExitConfirm(false);
        // Focus first home element
        setTimeout(() => {
           const hero = document.querySelector('section button');
           if (hero instanceof HTMLElement) hero.focus();
        }, 100);
      }
    };

    // Ensure focus is never lost (Spatial Navigation Help)
    const handleFocusOut = (e: FocusEvent) => {
      if (!e.relatedTarget) {
        // Focus was lost to "nowhere", try to restore it
        const lastFocused = e.target as HTMLElement;
        if (lastFocused && document.body.contains(lastFocused)) {
          setTimeout(() => lastFocused.focus(), 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('focusout', handleFocusOut);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, [activeModal, activeTab, showExitConfirm]);

  // Initial Focus Management for TV
  useEffect(() => {
    // When the component mounts or tab changes, focus the first interactive element
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const firstButton = document.querySelector('button, input, [tabindex="0"]');
      if (firstButton instanceof HTMLElement) {
        firstButton.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, activeModal.type]);

  const activeDoc = useMemo(() => {
    if (activeModal.type === 'viewer' || activeModal.type === 'editor' || activeModal.type === 'ai_copilot') {
      return documents.find((d) => d.id === activeModal.docId) || null;
    }
    return null;
  }, [activeModal, documents]);

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-center font-sans">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)] border border-white/20 mb-8 animate-pulse">
           <Tv className="w-14 h-14 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Leanback <span className="text-blue-400">Docs TV</span></h1>
        <p className="text-slate-500 uppercase tracking-[0.3em] text-xs font-bold mb-10">Initializing Ecosystem</p>
        <div className="w-64 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
           <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(150%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-10 text-center">
        <div className="max-w-md bg-red-900/20 border border-red-500/30 p-8 rounded-3xl">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Initialization Failed</h1>
          <p className="text-slate-400 mb-6">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.15)_0%,transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(79,70,229,0.1)_0%,transparent_40%)] pointer-events-none" />

      <Header 
        onRemoteClick={() => setActiveModal({ type: 'remote' })}
        onSettingsClick={() => setActiveTab('settings')}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={(tab) => {
          if (tab === 'transfer') {
            setActiveModal({ type: 'transfer' });
          } else if (tab === 'cloud') {
            setActiveModal({ type: 'cloud' });
          } else {
            setActiveTab(tab);
            if (tab === 'home') setActiveModal({ type: 'library' });
          }
        }} />

        <main className="flex-1 flex flex-col relative tv-safe-area">

          {activeTab === 'home' && activeModal.type === 'library' ? (
            <Dashboard 
              documents={documents}
              recentFiles={recentFiles}
              storageInfo={storageInfo}
              onNewDoc={() => setActiveModal({ type: 'new_note' })} 
              onSelectCategory={(cat) => {
                if (cat === 'usb' || cat === 'internal') setActiveTab(cat);
                if (cat === 'network') setActiveModal({ type: 'nas_setup' });
                if (cat === 'edit') setActiveTab('documents');
              }}
              onSelectDoc={(id) => handleSelectDoc(id, 'view')}
              onFilterDocs={handleFilterDocs}
            />
          ) : activeTab === 'documents' || activeTab === 'recent' || activeTab === 'search' || activeTab === 'usb' || activeTab === 'internal' || activeTab === 'network' ? (
            <DocumentLibrary
              initialFilter={docFilter}
              documents={documents.filter(d => {
                if (activeTab === 'usb') return d.source === 'usb';
                if (activeTab === 'internal') return d.source === 'internal';
                if (activeTab === 'network') return d.source === 'network';
                if (activeTab === 'recent') return recentFiles.some(r => r.docId === d.id);
                return true;
              })}
              onSelectDoc={handleSelectDoc}
              onRenameDoc={handleRenameDoc}
              onDeleteDoc={handleDeleteDoc}
              onNewDocClick={() => setActiveModal({ type: 'new_note' })}
              onImportClick={handleNativeFilePick}
              onCreateFolder={handleCreateFolder}
            />
          ) : activeTab === 'settings' ? (
             <SettingsModal 
               settings={settings!} 
               onSave={(s) => { setSettings(s); db.saveSettings(s); }} 
               onClose={() => setActiveTab('home')} 
             />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 font-medium uppercase tracking-[0.2em]">
              Section: {activeTab}
            </div>
          )}
        </main>
      </div>

      <StatusBar />

      {/* Modals & Viewers */}
      {activeModal.type === 'viewer' && activeDoc && (
        <>
          {activeDoc.type === 'pdf' && (
            <PdfViewerModal doc={activeDoc} onClose={() => setActiveModal({ type: 'library' })} onOpenAi={() => setActiveModal({ type: 'ai_copilot', docId: activeDoc.id })} />
          )}
          {(activeDoc.type === 'docx' || activeDoc.type === 'doc') && (
            <WordViewerModal doc={activeDoc} onClose={() => setActiveModal({ type: 'library' })} onOpenAi={() => setActiveModal({ type: 'ai_copilot', docId: activeDoc.id })} />
          )}
          {(activeDoc.type === 'xlsx' || activeDoc.type === 'xls') && (
            <ExcelViewerModal doc={activeDoc} onClose={() => setActiveModal({ type: 'library' })} onOpenAi={() => setActiveModal({ type: 'ai_copilot', docId: activeDoc.id })} />
          )}
          {(activeDoc.type === 'pptx' || activeDoc.type === 'ppt') && (
            <PowerPointViewerModal doc={activeDoc} onClose={() => setActiveModal({ type: 'library' })} onOpenAi={() => setActiveModal({ type: 'ai_copilot', docId: activeDoc.id })} />
          )}
          {['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(activeDoc.type) && (
            <ImageViewerModal doc={activeDoc} onClose={() => setActiveModal({ type: 'library' })} />
          )}
          {activeDoc.type === 'csv' && (
            <CsvViewerModal doc={activeDoc} onClose={() => setActiveModal({ type: 'library' })} onOpenAi={() => setActiveModal({ type: 'ai_copilot', docId: activeDoc.id })} />
          )}
          {['txt', 'md', 'json'].includes(activeDoc.type) && (
            <TextEditorModal doc={activeDoc} onClose={() => setActiveModal({ type: 'library' })} onSave={(updated) => handleSaveDocContent(activeDoc.id, updated)} />
          )}
        </>
      )}

      {activeModal.type === 'editor' && activeDoc && (
        <TextEditorModal doc={activeDoc} onClose={() => setActiveModal({ type: 'library' })} onSave={(updated) => handleSaveDocContent(activeDoc.id, updated)} />
      )}

      {activeModal.type === 'ai_copilot' && activeDoc && (
        <AiAssistantModal doc={activeDoc} onClose={() => setActiveModal({ type: 'viewer', docId: activeDoc.id })} />
      )}

      {activeModal.type === 'new_note' && (
        <NewNoteModal 
          onClose={() => setActiveModal({ type: 'library' })} 
          onAddDoc={(title, content) => handleAddNote(title, content)} 
        />
      )}

      {activeModal.type === 'remote' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
          <RemoteSimulator
            onDirection={(dir) => console.log('D-pad press:', dir)}
            onSelect={() => console.log('D-pad OK')}
            onBack={() => setActiveModal({ type: 'library' })}
            onHome={() => { setActiveTab('home'); setActiveModal({ type: 'library' }); }}
            onVoiceSearch={() => activeDoc ? setActiveModal({ type: 'ai_copilot', docId: activeDoc.id }) : setActiveModal({ type: 'ai_copilot', docId: documents[0]?.id })}
            onClose={() => setActiveModal({ type: 'library' })}
          />
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[40px] p-12 max-w-lg w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
               <Info className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Exit Application?</h3>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">Are you sure you want to exit Leanback Docs TV? Your current progress is saved.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all focus:ring-4 focus:ring-blue-500 outline-none"
              >
                Stay
              </button>
              <button 
                onClick={() => CapApp.exitApp()}
                className="flex-1 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all focus:ring-4 focus:ring-white shadow-lg shadow-red-500/20 outline-none"
              >
                Exit App
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal.type === 'nas_setup' && (
        <NasSetupModal 
          onClose={() => setActiveModal({ type: 'library' })}
          onConnect={async (conn) => {
            const newConn: NetworkConnection = { 
              ...conn, 
              id: `nas-${Date.now()}`, 
              status: 'connected' 
            };
            const updated = [...nasConnections, newConn];
            setNasConnections(updated);
            await db.saveNasConnection(newConn);
            setActiveTab('network');
            setActiveModal({ type: 'library' });
          }}
        />
      )}

      {activeModal.type === 'transfer' && (
        <TransferModal 
          onClose={() => setActiveModal({ type: 'library' })} 
          onOpenDoc={async (filename) => {
            try {
              const response = await fetch(getApiUrl(`/api/transfers/${filename}`));
              if (response.ok) {
                const data = await response.json();
                const ext = filename.split('.').pop()?.toLowerCase() as DocumentType || 'txt';
                
                // Temporary document item for the transferred file
                const tempDoc: DocumentItem = {
                  id: `transfer-${Date.now()}`,
                  title: filename,
                  type: ext,
                  size: 'Unknown',
                  updatedAt: new Date().toISOString().split('T')[0],
                  author: 'Remote User',
                  tags: ['Transferred'],
                  isEditable: ['txt', 'md'].includes(ext),
                  path: filename,
                  source: 'internal',
                  content: data.content
                };

                // Add to documents list so viewers can find it
                setDocuments(prev => [tempDoc, ...prev]);
                
                // Parse if needed
                if (ext === 'docx') {
                  tempDoc.content = await docParser.parseDocx(data.content);
                } else if (ext === 'xlsx') {
                  tempDoc.content = await docParser.parseXlsx(data.content);
                }

                setActiveModal({ type: 'viewer', docId: tempDoc.id });
              }
            } catch (err) {
              console.error('Failed to open transferred doc:', err);
            }
          }}
        />
      )}

      {activeModal.type === 'cloud' && (
        <CloudStorageModal 
          onClose={() => setActiveModal({ type: 'library' })}
          onSelectDoc={(file) => {
            console.log('Cloud file selected:', file);
            // Handle cloud file opening
          }}
        />
      )}
    </div>
  );
}
