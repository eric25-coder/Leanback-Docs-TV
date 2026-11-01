import { Preferences } from '@capacitor/preferences';
import { AppSettings, RecentFile, NetworkConnection, UserNote, DocumentItem } from '../types';

const KEYS = {
  SETTINGS: 'leanback_settings',
  RECENT: 'leanback_recent',
  NAS: 'leanback_nas',
  NOTES: 'leanback_notes',
  DOC_METADATA: 'leanback_docs_metadata',
};

export const db = {
  async getSettings(): Promise<AppSettings> {
    const { value } = await Preferences.get({ key: KEYS.SETTINGS });
    if (value) return JSON.parse(value);
    return {
      theme: 'dark',
      accentColor: '#3b82f6',
      defaultZoom: 100,
      rememberPosition: true,
      autoScanUsb: true,
    };
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await Preferences.set({ key: KEYS.SETTINGS, value: JSON.stringify(settings) });
  },

  async getRecentFiles(): Promise<RecentFile[]> {
    const { value } = await Preferences.get({ key: KEYS.RECENT });
    return value ? JSON.parse(value) : [];
  },

  async addRecentFile(docId: string, position?: any): Promise<void> {
    const recent = await this.getRecentFiles();
    const filtered = recent.filter(r => r.docId !== docId);
    filtered.unshift({ docId, openedAt: new Date().toISOString(), lastPosition: position });
    await Preferences.set({ key: KEYS.RECENT, value: JSON.stringify(filtered.slice(0, 50)) });
  },

  async clearRecent(): Promise<void> {
    await Preferences.remove({ key: KEYS.RECENT });
  },

  async getNasConnections(): Promise<NetworkConnection[]> {
    const { value } = await Preferences.get({ key: KEYS.NAS });
    return value ? JSON.parse(value) : [];
  },

  async saveNasConnection(conn: NetworkConnection): Promise<void> {
    const conns = await this.getNasConnections();
    const idx = conns.findIndex(c => c.id === conn.id);
    if (idx >= 0) conns[idx] = conn;
    else conns.push(conn);
    await Preferences.set({ key: KEYS.NAS, value: JSON.stringify(conns) });
  },

  async getNotes(): Promise<UserNote[]> {
    const { value } = await Preferences.get({ key: KEYS.NOTES });
    return value ? JSON.parse(value) : [];
  },

  async saveNote(note: UserNote): Promise<void> {
    const notes = await this.getNotes();
    const idx = notes.findIndex(n => n.id === note.id);
    if (idx >= 0) notes[idx] = note;
    else notes.push(note);
    await Preferences.set({ key: KEYS.NOTES, value: JSON.stringify(notes) });
  },

  async deleteNote(id: string): Promise<void> {
    const notes = await this.getNotes();
    await Preferences.set({ key: KEYS.NOTES, value: JSON.stringify(notes.filter(n => n.id !== id)) });
  },

  async getDocMetadata(): Promise<DocumentItem[]> {
    const { value } = await Preferences.get({ key: KEYS.DOC_METADATA });
    return value ? JSON.parse(value) : [];
  },

  async saveDocMetadata(docs: DocumentItem[]): Promise<void> {
    await Preferences.set({ key: KEYS.DOC_METADATA, value: JSON.stringify(docs) });
  }
};
