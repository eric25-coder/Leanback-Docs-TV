export type DocumentType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'md' | 'json' | 'csv' | 'folder';

export interface DocumentItem {
  id: string;
  title: string;
  type: DocumentType;
  size: string;
  sizeBytes?: number;
  updatedAt: string;
  author: string;
  tags: string[];
  isEditable: boolean;
  path: string; // Uri or Filesystem path
  source: 'internal' | 'usb' | 'network' | 'app';
  content?: any;
}

export interface RecentFile {
  docId: string;
  openedAt: string;
  lastPosition?: any;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  accentColor: string;
  defaultZoom: number;
  rememberPosition: boolean;
  autoScanUsb: boolean;
}

export interface NetworkConnection {
  id: string;
  label: string;
  host: string;
  share: string;
  username?: string;
  password?: string;
  status: 'connected' | 'disconnected' | 'error' | string;
  error?: string;
}

export interface DocxContent {
  paragraphs: {
    id: string;
    type: string;
    text: string;
  }[];
}

export interface XlsxContent {
  sheets: {
    sheetName: string;
    rows: any[][];
  }[];
}

export interface PptxContent {
  slides: {
    slideNumber: number;
    title: string;
    bullets: string[];
    notes: string;
    backgroundTheme?: string;
  }[];
}

export interface UserNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type ActiveModal = 
  | { type: 'library' }
  | { type: 'viewer'; docId: string }
  | { type: 'editor'; docId: string }
  | { type: 'remote' }
  | { type: 'ai_copilot'; docId: string }
  | { type: 'settings' }
  | { type: 'convert' }
  | { type: 'new_note'; noteId?: string }
  | { type: 'tv_storage' }
  | { type: 'nas_setup' };

export interface StorageInfo {
  free: number;
  total: number;
  freeFormatted: string;
  totalFormatted: string;
  percentUsed: number;
}

