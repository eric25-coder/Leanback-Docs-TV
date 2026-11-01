export type DocumentType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'md' | 'json' | 'csv';

export interface DocumentItem {
  id: string;
  title: string;
  type: DocumentType;
  size: string;
  updatedAt: string;
  author: string;
  tags: string[];
  isEditable: boolean;
  content: string | PdfContent | DocxContent | XlsxContent | PptxContent;
}

export interface PdfContent {
  totalPages: number;
  pages: { pageNumber: number; text: string; imageUrl?: string }[];
}

export interface DocxContent {
  paragraphs: { id: string; type: 'heading' | 'paragraph' | 'bullet' | 'quote'; text: string }[];
}

export interface XlsxContent {
  sheets: {
    sheetName: string;
    rows: string[][];
  }[];
}

export interface PptxContent {
  slides: {
    slideNumber: number;
    title: string;
    bullets: string[];
    notes: string;
    backgroundTheme: string;
  }[];
}

export type ActiveModal = 
  | { type: 'library' }
  | { type: 'viewer'; docId: string }
  | { type: 'editor'; docId: string }
  | { type: 'remote' }
  | { type: 'ai_copilot'; docId: string }
  | { type: 'settings' };
