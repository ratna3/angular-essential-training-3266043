import { FileAttachment } from './file-attachment';
import { Admin } from './admin';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  likedBy: string[]; // user IDs
  attachments: FileAttachment[]; // file attachments
  createdBy: Admin; // Admin who created this announcement
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  isPublic: boolean; // Whether visible to public users
}
