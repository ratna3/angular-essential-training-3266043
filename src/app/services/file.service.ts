import { Injectable, signal } from '@angular/core';
import { FileAttachment, FileAnalytics, FileInteraction } from '../interfaces/file-attachment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly FILE_STORAGE_KEY = 'announcement-portal-files';
  private readonly FILE_ANALYTICS_KEY = 'announcement-portal-file-analytics';
  
  private files = signal<FileAttachment[]>(this.loadFiles());
  private analytics = signal<FileAnalytics[]>(this.loadAnalytics());

  public files$ = this.files.asReadonly();
  public analytics$ = this.analytics.asReadonly();

  // Callback for notifying announcement service of downloads
  private onDownloadCallback?: (fileId: string) => void;

  private loadFiles(): FileAttachment[] {
    const stored = localStorage.getItem(this.FILE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private loadAnalytics(): FileAnalytics[] {
    const stored = localStorage.getItem(this.FILE_ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveFiles(): void {
    localStorage.setItem(this.FILE_STORAGE_KEY, JSON.stringify(this.files()));
  }

  private saveAnalytics(): void {
    localStorage.setItem(this.FILE_ANALYTICS_KEY, JSON.stringify(this.analytics()));
  }

  public async uploadFile(file: File): Promise<FileAttachment> {
    return new Promise((resolve, reject) => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        reject(new Error('File size exceeds 10MB limit'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const fileAttachment: FileAttachment = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: this.sanitizeFileName(file.name),
          originalName: file.name,
          type: file.type || this.getFileTypeFromExtension(file.name),
          size: file.size,
          data: reader.result as string,
          uploadedAt: new Date(),
          downloads: 0,
          views: 0,
          downloadedBy: [],
          viewedBy: []
        };

        this.files.update(files => [...files, fileAttachment]);
        this.saveFiles();

        // Initialize analytics
        const analytics: FileAnalytics = {
          fileId: fileAttachment.id,
          fileName: fileAttachment.originalName,
          totalDownloads: 0,
          totalViews: 0,
          downloadHistory: [],
          viewHistory: []
        };

        this.analytics.update(analyticsArray => [...analyticsArray, analytics]);
        this.saveAnalytics();

        resolve(fileAttachment);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  public getFile(fileId: string): FileAttachment | null {
    return this.files().find(f => f.id === fileId) || null;
  }

  public getFilesByIds(fileIds: string[]): FileAttachment[] {
    return this.files().filter(f => fileIds.includes(f.id));
  }

  public deleteFile(fileId: string): boolean {
    const initialCount = this.files().length;
    
    this.files.update(files => files.filter(f => f.id !== fileId));
    this.analytics.update(analytics => analytics.filter(a => a.fileId !== fileId));
    
    this.saveFiles();
    this.saveAnalytics();
    
    return this.files().length < initialCount;
  }

  public viewFile(fileId: string, userId: string, userName: string, userEmail: string): void {
    const file = this.getFile(fileId);
    if (!file) return;

    // Update file view count
    this.files.update(files => 
      files.map(f => {
        if (f.id === fileId) {
          const hasViewed = f.viewedBy.includes(userId);
          return {
            ...f,
            views: hasViewed ? f.views : f.views + 1,
            viewedBy: hasViewed ? f.viewedBy : [...f.viewedBy, userId]
          };
        }
        return f;
      })
    );

    // Update analytics
    this.analytics.update(analyticsArray => 
      analyticsArray.map(a => {
        if (a.fileId === fileId) {
          const interaction: FileInteraction = {
            userId,
            userName,
            userEmail,
            timestamp: new Date(),
            action: 'view'
          };

          return {
            ...a,
            totalViews: a.totalViews + 1,
            lastViewed: new Date(),
            viewHistory: [...a.viewHistory, interaction]
          };
        }
        return a;
      })
    );

    this.saveFiles();
    this.saveAnalytics();
  }

  public downloadFile(fileId: string, userId: string, userName: string, userEmail: string): void {
    const file = this.getFile(fileId);
    if (!file) return;

    // Update file download count
    this.files.update(files => 
      files.map(f => {
        if (f.id === fileId) {
          const hasDownloaded = f.downloadedBy.includes(userId);
          return {
            ...f,
            downloads: f.downloads + 1, // Always increment for multiple downloads
            downloadedBy: hasDownloaded ? f.downloadedBy : [...f.downloadedBy, userId]
          };
        }
        return f;
      })
    );

    // Update analytics
    this.analytics.update(analyticsArray => 
      analyticsArray.map(a => {
        if (a.fileId === fileId) {
          const interaction: FileInteraction = {
            userId,
            userName,
            userEmail,
            timestamp: new Date(),
            action: 'download'
          };

          return {
            ...a,
            totalDownloads: a.totalDownloads + 1,
            lastDownloaded: new Date(),
            downloadHistory: [...a.downloadHistory, interaction]
          };
        }
        return a;
      })
    );

    this.saveFiles();
    this.saveAnalytics();

    // Notify announcement service of the download
    if (this.onDownloadCallback) {
      this.onDownloadCallback(fileId);
    }

    // Trigger file download
    this.triggerFileDownload(file);
  }

  public setDownloadCallback(callback: (fileId: string) => void): void {
    this.onDownloadCallback = callback;
  }

  private triggerFileDownload(file: FileAttachment): void {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public getFileAnalytics(fileId: string): FileAnalytics | null {
    return this.analytics().find(a => a.fileId === fileId) || null;
  }

  public getAllAnalytics(): FileAnalytics[] {
    return this.analytics();
  }

  public getFileIcon(fileType: string): string {
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) return 'bi-file-earmark-pdf';
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('sheet')) return 'bi-file-earmark-excel';
    if (type.includes('word') || type.includes('document')) return 'bi-file-earmark-word';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'bi-file-earmark-ppt';
    if (type.includes('image') || type.includes('jpeg') || type.includes('jpg') || type.includes('png') || type.includes('gif')) return 'bi-file-earmark-image';
    if (type.includes('video')) return 'bi-file-earmark-play';
    if (type.includes('audio')) return 'bi-file-earmark-music';
    if (type.includes('text')) return 'bi-file-earmark-text';
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return 'bi-file-earmark-zip';
    
    return 'bi-file-earmark';
  }

  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  private getFileTypeFromExtension(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const typeMap: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed'
    };

    return typeMap[extension || ''] || 'application/octet-stream';
  }

  public clearAllData(): void {
    this.files.set([]);
    this.analytics.set([]);
    localStorage.removeItem(this.FILE_STORAGE_KEY);
    localStorage.removeItem(this.FILE_ANALYTICS_KEY);
  }
}
