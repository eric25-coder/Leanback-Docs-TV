import React, { useState, useEffect } from 'react';
import { INITIAL_DOCUMENTS } from './sampleDocs';
import { DocumentItem, ActiveModal } from './types';
import { Header } from './components/Header';
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

export default function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('leanback_docs_tv_final_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_DOCUMENTS;
  });

  const [activeModal, setActiveModal] = useState<ActiveModal>({ type: 'library' });

  useEffect(() => {
    localStorage.setItem('leanback_docs_tv_final_v1', JSON.stringify(documents));
  }, [documents]);

  // Global D-Pad Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal({ type: 'library' });
      } else if (e.key === 'h' || e.key === 'H') {
        setActiveModal({ type: 'library' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectDoc = (id: string, mode: 'view' | 'edit') => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    if (mode === 'edit') {
      setActiveModal({ type: 'editor', docId: id });
    } else {
      setActiveModal({ type: 'viewer', docId: id });
    }
  };

  const handleSaveDocContent = (docId: string, updatedContent: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          let parsed: any = updatedContent;
          if (d.type === 'json') {
            try {
              parsed = JSON.parse(updatedContent);
            } catch (e) {
              parsed = updatedContent;
            }
          }
          return { ...d, content: parsed, updatedAt: new Date().toISOString().split('T')[0] };
        }
        return d;
      })
    );
  };

  const handleAddDocument = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveModal({ type: 'library' });
  };

  const activeDoc =
    activeModal.type === 'viewer' || activeModal.type === 'editor' || activeModal.type === 'ai_copilot'
      ? documents.find((d) => d.id === activeModal.docId)
      : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar Header */}
      <Header
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        onNewDocClick={() => setActiveModal({ type: 'new_note' } as any)}
      />

      {/* Main Library View */}
      {activeModal.type === 'library' && (
        <DocumentLibrary
          documents={documents}
          onSelectDoc={handleSelectDoc}
          onNewDocClick={() => setActiveModal({ type: 'new_note' } as any)}
        />
      )}

      {/* Viewers & Editors */}
      {activeModal.type === 'viewer' && activeDoc && (
        <>
          {activeDoc.type === 'pdf' && (
            <PdfViewerModal
              doc={activeDoc}
              onClose={() => setActiveModal({ type: 'library' })}
              onOpenAi={() => setActiveModal({ type: 'ai_copilot', docId: activeDoc.id })}
            />
          )}
          {activeDoc.type === 'docx' && (
            <WordViewerModal
              doc={activeDoc}
              onClose={() => setActiveModal({ type: 'library' })}
              onOpenAi={() => setActiveModal({ type: 'ai_copilot', docId: activeDoc.id })}
            />
          )}
          {activeDoc.type === 'xlsx' && (
            <ExcelViewerModal
              doc={activeDoc}
              onClose={() => setActiveModal({ type: 'library' })}
              onOpenAi={() => setActiveModal({ type: 'ai_copilot', docId: activeDoc.id })}
            />
          )}
          {activeDoc.type === 'pptx' && (
            <PowerPointViewerModal
              doc={activeDoc}
              onClose={() => setActiveModal({ type: 'library' })}
              onOpenAi={() => setActiveModal({ type: 'ai_copilot', docId: activeDoc.id })}
            />
          )}
          {['txt', 'md', 'json', 'csv'].includes(activeDoc.type) && (
            <TextEditorModal
              doc={activeDoc}
              onClose={() => setActiveModal({ type: 'library' })}
              onSave={(updated) => handleSaveDocContent(activeDoc.id, updated)}
            />
          )}
        </>
      )}

      {activeModal.type === 'editor' && activeDoc && (
        <TextEditorModal
          doc={activeDoc}
          onClose={() => setActiveModal({ type: 'library' })}
          onSave={(updated) => handleSaveDocContent(activeDoc.id, updated)}
        />
      )}

      {activeModal.type === 'ai_copilot' && activeDoc && (
        <AiAssistantModal
          doc={activeDoc}
          onClose={() => setActiveModal({ type: 'viewer', docId: activeDoc.id })}
        />
      )}

      {activeModal.type === 'settings' && (
        <SettingsModal onClose={() => setActiveModal({ type: 'library' })} />
      )}

      {(activeModal as any).type === 'convert' && (
        <ConversionModal
          documents={documents}
          onClose={() => setActiveModal({ type: 'library' })}
          onConversionComplete={(newDoc) => {
            handleAddDocument(newDoc);
          }}
        />
      )}

      {(activeModal as any).type === 'new_note' && (
        <NewNoteModal
          onClose={() => setActiveModal({ type: 'library' })}
          onAddDoc={handleAddDocument}
        />
      )}

      {/* Virtual Remote Control Simulator Modal */}
      {activeModal.type === 'remote' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
          <RemoteSimulator
            onDirection={(dir) => {
              console.log('D-pad directional press:', dir);
            }}
            onSelect={() => {
              console.log('D-pad OK / Select press');
            }}
            onBack={() => setActiveModal({ type: 'library' })}
            onHome={() => setActiveModal({ type: 'library' })}
            onVoiceSearch={() => {
              if (activeDoc) {
                setActiveModal({ type: 'ai_copilot', docId: activeDoc.id });
              } else if (documents.length > 0) {
                setActiveModal({ type: 'ai_copilot', docId: documents[0].id });
              }
            }}
            onClose={() => setActiveModal({ type: 'library' })}
          />
        </div>
      )}
    </div>
  );
}
