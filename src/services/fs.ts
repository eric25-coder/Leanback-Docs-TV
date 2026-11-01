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

  async getStorageInfo(): Promise<{ free: number; total: number; freeFormatted: string; totalFormatted: string; percentUsed: number }> {
    try {
      // Mocking for TV environment as Capacitor Filesystem doesn't expose full disk info easily
      // In a real app, you might use a dedicated plugin like 'capacitor-disk-space'
      const total = 1024 * 1024 * 1024 * 32; // 32GB
      const free = 1024 * 1024 * 1024 * 12.4; // 12.4GB free
      const used = total - free;
      const percentUsed = Math.round((used / total) * 100);

      const formatSize = (bytes: number) => {
        const gb = bytes / (1024 * 1024 * 1024);
        return `${gb.toFixed(1)} GB`;
      };

      return { 
        free, 
        total, 
        freeFormatted: formatSize(free), 
        totalFormatted: formatSize(total),
        percentUsed
      };
    } catch (e) {
      return { free: 0, total: 0, freeFormatted: '0 GB', totalFormatted: '0 GB', percentUsed: 0 };
    }
  },

  async checkPermissions(): Promise<boolean> {
    try {
      const status = await Filesystem.checkPermissions();
      if (status.publicStorage !== 'granted') {
        const request = await Filesystem.requestPermissions();
        return request.publicStorage === 'granted';
      }
      return true;
    } catch (e) {
      console.error('[FS] Permission check error:', e);
      return false;
    }
  }
};
