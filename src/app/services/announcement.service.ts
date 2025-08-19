import { Injectable, signal } from '@angular/core';
import { Announcement } from '../interfaces/announcement';
import { FileAttachment } from '../interfaces/file-attachment';
import { Admin } from '../interfaces/admin';
import { HierarchicalAdminService } from './hierarchical-admin.service';
import { IRRIGATION_ROLES } from '../interfaces/role';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private readonly STORAGE_KEY = 'announcement-portal-announcements';
  
  private announcements = signal<Announcement[]>(this.loadAnnouncements());
  
  public announcements$ = this.announcements.asReadonly();

  constructor(private hierarchicalAdminService: HierarchicalAdminService) {}

  private loadAnnouncements(): Announcement[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    let announcements = stored ? JSON.parse(stored) : [];
    
    // Migrate old announcements to include createdBy field
    announcements = announcements.map((ann: any) => {
      if (!ann.createdBy) {
        // Assign to legacy admin for old announcements
        const legacyAdmin = this.hierarchicalAdminService.getAdminById('admin-legacy');
        return {
          ...ann,
          createdBy: legacyAdmin || {
            id: 'system',
            username: 'system',
            email: 'system@announcement.com',
            fullName: 'System Administrator',
            role: IRRIGATION_ROLES[2], // Chief Engineer-I level
            department: 'IT Division',
            isActive: true,
            createdAt: new Date(),
            password: ''
          },
          isPublic: ann.isPublic !== undefined ? ann.isPublic : true,
          priority: ann.priority || 'medium'
        };
      }
      return ann;
    });
    
    // Initialize with default announcement if none exists
    if (announcements.length === 0) {
      const systemAdmin = this.hierarchicalAdminService.getAdminById('admin-legacy');
      const defaultAnnouncement: Announcement = {
        id: '1',
        title: 'स्वागत है UPID सूचना पोर्टल में! | Welcome to UPID Suchana Portal!',
        content: 'यह पोर्टल उत्तर प्रदेश सिंचाई विभाग के सभी स्तरों पर पदानुक्रमित संचार को सक्षम बनाता है। अधिकारी वरिष्ठता के आधार पर उपयुक्त पहुंच नियंत्रण के साथ महत्वपूर्ण अपडेट, दस्तावेज़ और परिपत्र साझा कर सकते हैं। | This portal enables hierarchical communication across all levels of the UP Irrigation Department. Officers can share important updates, documents, and circulars with appropriate access controls based on seniority.',
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        likedBy: [],
        attachments: [],
        createdBy: systemAdmin || {
          id: 'system',
          username: 'system',
          email: 'system@announcement.com',
          fullName: 'System Administrator',
          role: IRRIGATION_ROLES[2],
          department: 'IT Division',
          isActive: true,
          createdAt: new Date(),
          password: ''
        },
        isPublic: true,
        priority: 'high'
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

  public getAnnouncementById(id: string): Announcement | null {
    const announcements = this.announcements();
    return announcements.find(a => a.id === id) || null;
  }

  public createOrUpdateAnnouncement(title: string, content: string, attachments: FileAttachment[] = [], creator?: Admin): Announcement {
    const now = new Date();
    const currentAdmin = creator || this.hierarchicalAdminService.getCurrentAdmin();
    const latest = this.getLatestAnnouncement();
    
    if (!currentAdmin) {
      throw new Error('No authenticated admin found');
    }
    
    if (latest) {
      // Update existing announcement only if current admin can edit it
      if (this.canEditAnnouncement(latest, currentAdmin)) {
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
        throw new Error('You do not have permission to edit this announcement');
      }
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
        attachments: attachments,
        createdBy: currentAdmin,
        isPublic: true,
        priority: 'medium'
      };
      
      this.announcements.update(announcements => [...announcements, newAnnouncement]);
    }
    
    this.saveAnnouncements();
    const latestAnnouncement = this.getLatestAnnouncement();
    return latestAnnouncement as Announcement;
  }

  public createNewAnnouncement(title: string, content: string, attachments: FileAttachment[] = [], priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium', isPublic = true): Announcement {
    const now = new Date();
    const currentAdmin = this.hierarchicalAdminService.getCurrentAdmin();
    
    if (!currentAdmin) {
      throw new Error('No authenticated admin found');
    }
    
    // Always create a new announcement
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
      likes: 0,
      likedBy: [],
      attachments: attachments,
      createdBy: currentAdmin,
      isPublic: isPublic,
      priority: priority
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

  public syncFileDownloads(fileService: any): void {
    // Sync download counts from file service to announcements
    this.announcements.update(announcements => 
      announcements.map(announcement => ({
        ...announcement,
        attachments: announcement.attachments.map(attachment => {
          const fileData = fileService.getFile(attachment.id);
          return fileData ? { ...attachment, downloads: fileData.downloads } : attachment;
        })
      }))
    );
    this.saveAnnouncements();
  }

  public updateFileDownloadCount(fileId: string): void {
    // Update download count for specific file in all announcements
    this.announcements.update(announcements => 
      announcements.map(announcement => ({
        ...announcement,
        attachments: announcement.attachments.map(attachment => 
          attachment.id === fileId 
            ? { ...attachment, downloads: attachment.downloads + 1 }
            : attachment
        )
      }))
    );
    this.saveAnnouncements();
  }

  public clearAllData(): void {
    this.announcements.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Hierarchical access control methods
  public getAnnouncementsForCurrentAdmin(): Announcement[] {
    const currentAdmin = this.hierarchicalAdminService.getCurrentAdmin();
    if (!currentAdmin) return [];

    return this.announcements().filter(announcement => 
      this.hierarchicalAdminService.canViewAnnouncement(currentAdmin, announcement.createdBy)
    );
  }

  public getSubordinateAnnouncements(): Announcement[] {
    const currentAdmin = this.hierarchicalAdminService.getCurrentAdmin();
    if (!currentAdmin) return [];

    return this.announcements().filter(announcement => 
      announcement.createdBy.role.seniorityLevel > currentAdmin.role.seniorityLevel
    );
  }

  public getAnnouncementsByOfficer(officerId: string): Announcement[] {
    return this.announcements().filter(announcement => 
      announcement.createdBy.id === officerId
    );
  }

  public canEditAnnouncement(announcement: Announcement, currentAdmin: Admin): boolean {
    return this.hierarchicalAdminService.canEditAnnouncement(currentAdmin, announcement.createdBy);
  }

  public canDeleteAnnouncement(announcement: Announcement, currentAdmin: Admin): boolean {
    return this.hierarchicalAdminService.canDeleteAnnouncement(currentAdmin, announcement.createdBy);
  }

  public canViewAnnouncement(announcement: Announcement, currentAdmin: Admin): boolean {
    return this.hierarchicalAdminService.canViewAnnouncement(currentAdmin, announcement.createdBy);
  }

  public getAnnouncementsByDepartment(department: string): Announcement[] {
    return this.announcements().filter(announcement => 
      announcement.createdBy.department === department
    );
  }

  public getAnnouncementsByPriority(priority: 'low' | 'medium' | 'high' | 'urgent'): Announcement[] {
    return this.announcements().filter(announcement => 
      announcement.priority === priority
    );
  }

  public getPublicAnnouncements(): Announcement[] {
    return this.announcements().filter(announcement => announcement.isPublic);
  }
}
