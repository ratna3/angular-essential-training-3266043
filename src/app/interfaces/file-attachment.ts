export interface FileAttachment {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  data: string; // base64 encoded file data
  uploadedAt: Date;
  downloads: number;
  views: number;
  downloadedBy: string[]; // user IDs who downloaded
  viewedBy: string[]; // user IDs who viewed
}

export interface FileAnalytics {
  fileId: string;
  fileName: string;
  totalDownloads: number;
  totalViews: number;
  lastDownloaded?: Date;
  lastViewed?: Date;
  downloadHistory: FileInteraction[];
  viewHistory: FileInteraction[];
}

export interface FileInteraction {
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: Date;
  action: 'download' | 'view';
}
