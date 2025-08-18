import { Injectable, computed, signal } from '@angular/core';
import { Announcement } from '../interfaces/announcement';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private announcement = signal<Announcement | null>(null);

  public announcement$ = computed(() => this.announcement());
  public hasAnnouncement = computed(() => this.announcement() !== null);

  constructor() {
    this.loadAnnouncement();
  }

  private loadAnnouncement(): void {
    const storedAnnouncement = localStorage.getItem('announcement-portal-announcement');
    if (storedAnnouncement) {
      const announcement = JSON.parse(storedAnnouncement);
      this.announcement.set({
        ...announcement,
        createdAt: new Date(announcement.createdAt),
        updatedAt: new Date(announcement.updatedAt)
      });
    }
  }

  private saveAnnouncement(): void {
    const current = this.announcement();
    if (current) {
      localStorage.setItem('announcement-portal-announcement', JSON.stringify(current));
    } else {
      localStorage.removeItem('announcement-portal-announcement');
    }
  }

  public createAnnouncement(title: string, content: string): Announcement {
    const newAnnouncement: Announcement = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      viewCount: 0
    };

    this.announcement.set(newAnnouncement);
    this.saveAnnouncement();
    return newAnnouncement;
  }

  public updateAnnouncement(title: string, content: string): Announcement | null {
    const current = this.announcement();
    if (!current) return null;

    const updated: Announcement = {
      ...current,
      title,
      content,
      updatedAt: new Date()
    };

    this.announcement.set(updated);
    this.saveAnnouncement();
    return updated;
  }

  public deleteAnnouncement(): void {
    this.announcement.set(null);
    localStorage.removeItem('announcement-portal-announcement');
    // Clear related data
    localStorage.removeItem('announcement-portal-users');
  }

  public incrementLikes(): void {
    const current = this.announcement();
    if (current) {
      const updated = { ...current, likes: current.likes + 1 };
      this.announcement.set(updated);
      this.saveAnnouncement();
    }
  }

  public decrementLikes(): void {
    const current = this.announcement();
    if (current && current.likes > 0) {
      const updated = { ...current, likes: current.likes - 1 };
      this.announcement.set(updated);
      this.saveAnnouncement();
    }
  }

  public incrementViewCount(): void {
    const current = this.announcement();
    if (current) {
      const updated = { ...current, viewCount: current.viewCount + 1 };
      this.announcement.set(updated);
      this.saveAnnouncement();
    }
  }
}
