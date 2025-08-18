import { Injectable, signal } from '@angular/core';
import { Announcement } from '../interfaces/announcement';
import { FileAttachment } from '../interfaces/file-attachment';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private readonly STORAGE_KEY = 'announcement-portal-announcements';
  
  private announcements = signal<Announcement[]>(this.loadAnnouncements());
  
  public announcements$ = this.announcements.asReadonly();

  private loadAnnouncements(): Announcement[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const announcements = stored ? JSON.parse(stored) : [];
    
    // Initialize with default announcement if none exists
    if (announcements.length === 0) {
      const defaultAnnouncement: Announcement = {
        id: '1',
        title: 'Welcome to Announcement Portal!',
        content: 'This is your first announcement. Admin can update or delete this message anytime. Stay tuned for more exciting updates!',
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        likedBy: [],
        attachments: []
      };
      announcements.push(defaultAnnouncement);
      this.saveAnnouncements(announcements);
    }
    
    return announcements;
  }

  private saveAnnouncements(announcements?: Announcement[]): void {
    const data = announcements || this.announcements();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  public getLatestAnnouncement(): Announcement | null {
    const announcements = this.announcements();
    return announcements.length > 0 ? announcements[announcements.length - 1] : null;
  }

  public getAllAnnouncements(): Announcement[] {
    return this.announcements();
  }

  public createOrUpdateAnnouncement(title: string, content: string, attachments: FileAttachment[] = []): Announcement {
    const now = new Date();
    const latest = this.getLatestAnnouncement();
    
    if (latest) {
      // Update existing announcement
      const updatedAnnouncement: Announcement = {
        ...latest,
        title: title.trim(),
        content: content.trim(),
        updatedAt: now,
        attachments: attachments
      };
      
      this.announcements.update(announcements => 
        announcements.map(a => a.id === latest.id ? updatedAnnouncement : a)
      );
    } else {
      // Create new announcement
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        createdAt: now,
        updatedAt: now,
        likes: 0,
        likedBy: [],
        attachments: attachments
      };
      
      this.announcements.update(announcements => [...announcements, newAnnouncement]);
    }
    
    this.saveAnnouncements();
    const latestAnnouncement = this.getLatestAnnouncement();
    return latestAnnouncement as Announcement;
  }

  public createNewAnnouncement(title: string, content: string, attachments: FileAttachment[] = []): Announcement {
    const now = new Date();
    
    // Always create a new announcement
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
      likes: 0,
      likedBy: [],
      attachments: attachments
    };
    
    this.announcements.update(announcements => [...announcements, newAnnouncement]);
    this.saveAnnouncements();
    return newAnnouncement;
  }

  public updateAnnouncement(id: string, title: string, content: string, attachments: FileAttachment[] = []): Announcement | null {
    const now = new Date();
    let updatedAnnouncement: Announcement | null = null;
    
    this.announcements.update(announcements => 
      announcements.map(a => {
        if (a.id === id) {
          updatedAnnouncement = {
            ...a,
            title: title.trim(),
            content: content.trim(),
            updatedAt: now,
            attachments: attachments
          };
          return updatedAnnouncement;
        }
        return a;
      })
    );
    
    this.saveAnnouncements();
    return updatedAnnouncement;
  }

  public deleteAnnouncement(announcementId: string): boolean {
    const initialCount = this.announcements().length;
    
    this.announcements.update(announcements => 
      announcements.filter(a => a.id !== announcementId)
    );
    
    this.saveAnnouncements();
    
    // Return true if announcement was actually deleted
    return this.announcements().length < initialCount;
  }

  public deleteLatestAnnouncement(): boolean {
    const latest = this.getLatestAnnouncement();
    if (latest) {
      return this.deleteAnnouncement(latest.id);
    }
    return false;
  }

  public toggleLike(announcementId: string, userId: string): boolean {
    let hasLiked = false;
    
    this.announcements.update(announcements => 
      announcements.map(announcement => {
        if (announcement.id === announcementId) {
          const userIndex = announcement.likedBy.indexOf(userId);
          
          if (userIndex > -1) {
            // Remove like
            return {
              ...announcement,
              likes: announcement.likes - 1,
              likedBy: announcement.likedBy.filter(id => id !== userId)
            };
          } else {
            // Add like
            hasLiked = true;
            return {
              ...announcement,
              likes: announcement.likes + 1,
              likedBy: [...announcement.likedBy, userId]
            };
          }
        }
        return announcement;
      })
    );
    
    this.saveAnnouncements();
    return hasLiked;
  }

  public hasUserLiked(announcementId: string, userId: string): boolean {
    const announcement = this.announcements().find(a => a.id === announcementId);
    return announcement ? announcement.likedBy.includes(userId) : false;
  }

  public hasAnnouncements(): boolean {
    return this.announcements().length > 0;
  }

  public clearAllData(): void {
    this.announcements.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
