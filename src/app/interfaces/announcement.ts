import { FileAttachment } from './file-attachment';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  likedBy: string[]; // user IDs
  attachments: FileAttachment[]; // file attachments
}
