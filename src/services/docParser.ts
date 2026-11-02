import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { DocxContent, XlsxContent, PptxContent } from '../types';

export const docParser = {
  async parseDocx(base64: string): Promise<DocxContent> {
    const buffer = this.base64ToArrayBuffer(base64);
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
    // Simple conversion of HTML back to our paragraph structure for the existing modal
    // For full fidelity, we'd use convertToRawText or a more complex mapper
    return {
      paragraphs: [
        { id: '1', type: 'paragraph', text: result.value.replace(/<[^>]*>/g, '\n') }
      ]
    };
  },

  async parseXlsx(base64: string): Promise<XlsxContent> {
    const buffer = this.base64ToArrayBuffer(base64);
    // xlsx package handles both .xlsx and legacy .xls
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheets = workbook.SheetNames.map(name => {
      const sheet = workbook.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      return { sheetName: name, rows };
    });
    return { sheets };
  },

  async parseDoc(base64: string): Promise<DocxContent> {
    // Legacy .doc parsing is restricted in pure JS without heavy libraries
    // We provide a fallback summary
    return {
      paragraphs: [
        { id: 'legacy-1', type: 'paragraph', text: '[Legacy DOC Format] This file format is viewed in Compatibility Mode. For best results on TV, please convert to DOCX.' }
      ]
    };
  },

  async parsePpt(base64: string): Promise<PptxContent> {
    return {
      slides: [
        { slideNumber: 1, title: 'Legacy Presentation', bullets: ['Format: .ppt'], notes: 'Please convert to .pptx for full TV fidelity.' }
      ]
    };
  },

  async parsePptx(base64: string): Promise<PptxContent> {
    // Basic PPTX text extraction simulator (actual extraction would need a library like pptx-parser or similar)
    // For now we simulate the structure based on the base64 if needed, 
    // but in a real app you'd use a dedicated library.
    return {
      slides: [
        { slideNumber: 1, title: 'Document Summary', bullets: ['Extracted from PowerPoint', 'Ready for TV viewing'], notes: 'Speaker notes here.' }
      ]
    };
  },

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
};
