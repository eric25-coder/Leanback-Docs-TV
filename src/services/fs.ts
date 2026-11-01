import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { DocumentItem, DocumentType } from '../types';

export const fs = {
  async listFiles(path: string, directory: Directory = Directory.Documents): Promise<DocumentItem[]> {
    try {
      const result = await Filesystem.readdir({ path, directory });
      return result.files.map(file => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        return {
          id: `${directory}-${path}-${file.name}`,
          title: file.name,
          type: (file.type === 'directory' ? 'folder' : ext) as DocumentType,
          size: file.size ? `${(file.size / 1024).toFixed(1)} KB` : '0 KB',
          sizeBytes: file.size,
          updatedAt: new Date(file.mtime || Date.now()).toISOString().split('T')[0],
          author: 'System',
          tags: [file.type === 'directory' ? 'Folder' : ext.toUpperCase()],
          isEditable: ['txt', 'md', 'json', 'csv'].includes(ext),
          path: `${path}/${file.name}`,
          source: directory === Directory.External ? 'usb' : 'internal',
        };
      });
    } catch (e) {
      console.error('FS error:', e);
      return [];
    }
  },

  async readFile(path: string, directory: Directory = Directory.Documents, isBinary = false): Promise<string> {
    const result = await Filesystem.readFile({
      path,
      directory,
      encoding: isBinary ? undefined : Encoding.UTF8,
    });
    return result.data as string;
  },

  async writeFile(path: string, data: string, directory: Directory = Directory.Documents): Promise<void> {
    await Filesystem.writeFile({
      path,
      data,
      directory,
      encoding: Encoding.UTF8,
      recursive: true
    });
  },

  async deleteFile(path: string, directory: Directory = Directory.Documents): Promise<void> {
    await Filesystem.deleteFile({ path, directory });
  },

  async renameFile(oldPath: string, newName: string, directory: Directory = Directory.Documents): Promise<void> {
    const parent = oldPath.split('/').slice(0, -1).join('/');
    await Filesystem.rename({
      from: oldPath,
      to: `${parent}/${newName}`,
      directory,
    });
  },

  async createFolder(path: string, directory: Directory = Directory.Documents): Promise<void> {
    await Filesystem.mkdir({
      path,
      directory,
      recursive: true
    });
  },

  async getStorageInfo(): Promise<{ free: number; total: number }> {
    try {
      // Note: This often only reports for internal storage in standard Capacitor
      const result = await Filesystem.stat({ path: '', directory: Directory.Documents });
      // Filesystem.stat doesn't give free space directly in core Capacitor
      // We'll mock reasonable values for the UI if stat doesn't provide it, 
      // but usually stat returns size of the directory/file.
      return { free: 1024 * 1024 * 500, total: 1024 * 1024 * 1024 * 8 }; // Mock 8GB total, 500MB free
    } catch (e) {
      return { free: 0, total: 0 };
    }
  },

  async checkPermissions(): Promise<boolean> {
    const status = await Filesystem.checkPermissions();
    if (status.publicStorage !== 'granted') {
      const request = await Filesystem.requestPermissions();
      return request.publicStorage === 'granted';
    }
    return true;
  }
};
