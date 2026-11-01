import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
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
import { ConversionModal } from './components/ConversionModal';
import { NasSetupModal } from './components/NasSetupModal';
import { Info } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Load Initial Data
  useEffect(() => {
    const init = async () => {
      try {
        const [savedSettings, savedRecent, savedNotes, savedNas] = await Promise.all([
          db.getSettings().catch(e => { console.error('Settings load fail:', e); return null; }),
          db.getRecentFiles().catch(e => { console.error('Recent files load fail:', e); return []; }),
          db.getNotes().catch(e => { console.error('Notes load fail:', e); return []; }),
          db.getNasConnections().catch(e => { console.error('NAS load fail:', e); return []; })
        ]);

        if (savedSettings) setSettings(savedSettings);
        setRecentFiles(savedRecent);
        setNotes(savedNotes);
        setNasConnections(savedNas);
        
        // Initial File Scan
        try {
          await fs.checkPermissions();
          await refreshFiles();
        } catch (fsErr) {
          console.warn('Initial file scan failed, likely permission denied:', fsErr);
        }
      } catch (error: any) {
        console.error('CRITICAL INIT ERROR:', error);
        setInitError(error?.message || 'Failed to initialize application data.');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const refreshFiles = async () => {
    const internalFiles = await fs.listFiles('', Directory.Documents);
    // On TV, USB is often Directory.External or a child of /storage
    // For this implementation, we try to read External if possible
    let usbFiles: DocumentItem[] = [];
    try {
      usbFiles = await fs.listFiles('', Directory.External);
    } catch (e) {}

    // Map notes to documents too so they appear in library
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

    setDocuments([...noteDocs, ...internalFiles, ...usbFiles]);
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
        const isBinary = ['pdf', 'docx', 'xlsx', 'pptx'].includes(doc.type);
        const data = await fs.readFile(doc.path, directory, isBinary);
        
        if (doc.type === 'docx') {
          doc.content = await docParser.parseDocx(data);
        } else if (doc.type === 'xlsx') {
          doc.content = await docParser.parseXlsx(data);
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
      // Android TV Back / Escape logic
      if (e.key === 'Escape' || e.key === 'Backspace') {
        // If a modal is open, close it first
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
        if (activeTab === 'home' && activeModal.type === 'library') {
          e.preventDefault();
          setShowExitConfirm(true);
          return;
        }
      } 
      
      // Home Key (Mapping 'h' as a fallback)
      if (e.key === 'h' || e.key === 'H') {
        setActiveTab('home');
        setActiveModal({ type: 'library' });
        setShowExitConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, activeTab]);

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

  if (isLoading) return null;

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
          setActiveTab(tab);
          if (tab === 'home') setActiveModal({ type: 'library' });
        }} />

        <main className="flex-1 flex flex-col relative">
          {activeTab === 'home' && activeModal.type === 'library' ? (
            <Dashboard 
              documents={documents}
              recentFiles={recentFiles}
              onNewDoc={() => setActiveModal({ type: 'new_note' })} 
              onSelectCategory={(cat) => {
                if (cat === 'usb' || cat === 'internal') setActiveTab(cat);
                if (cat === 'network') setActiveModal({ type: 'nas_setup' });
                if (cat === 'edit') setActiveTab('documents');
              }}
              onSelectDoc={(id) => handleSelectDoc(id, 'view')}
            />
          ) : activeTab === 'documents' || activeTab === 'recent' || activeTab === 'search' || activeTab === 'usb' || activeTab === 'internal' || activeTab === 'network' ? (
            <DocumentLibrary
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
          {activeDoc.type === 'docx' && (
            <WordViewerModal doc={activeDoc} onClose={() => setActiveModal({ type: 'library' })} onOpenAi={() => setActiveModal({ type: 'ai_copilot', docId: activeDoc.id })} />
          )}
          {activeDoc.type === 'xlsx' && (
            <ExcelViewerModal doc={activeDoc} onClose={() => setActiveModal({ type: 'library' })} onOpenAi={() => setActiveModal({ type: 'ai_copilot', docId: activeDoc.id })} />
          )}
          {activeDoc.type === 'pptx' && (
            <PowerPointViewerModal doc={activeDoc} onClose={() => setActiveModal({ type: 'library' })} onOpenAi={() => setActiveModal({ type: 'ai_copilot', docId: activeDoc.id })} />
          )}
          {['txt', 'md', 'json', 'csv'].includes(activeDoc.type) && (
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
                onClick={() => (window as any).App?.exitApp ? (window as any).App.exitApp() : window.close()}
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
    </div>
  );
}
