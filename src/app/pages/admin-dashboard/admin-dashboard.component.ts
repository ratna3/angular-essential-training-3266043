import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Announcement } from '../../interfaces/announcement';
import { AdminService } from '../../services/admin.service';
import { AnnouncementService } from '../../services/announcement.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  public title = signal('');
  public content = signal('');
  public isSubmitting = signal(false);
  public isDeleting = signal(false);
  public successMessage = signal('');
  public currentAnnouncement = signal<Announcement | null>(null);
  public showDeleteConfirm = signal(false);

  public viewedUsers = this.userService.viewedUsers;

  constructor(
    private adminService: AdminService,
    private announcementService: AnnouncementService,
    private userService: UserService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    if (!this.adminService.isAuthenticated()) {
      this.router.navigate(['/admin']);
      return;
    }

    this.loadCurrentAnnouncement();
  }

  private loadCurrentAnnouncement(): void {
    const announcement = this.announcementService.getLatestAnnouncement();
    this.currentAnnouncement.set(announcement);
    
    if (announcement) {
      this.title.set(announcement.title);
      this.content.set(announcement.content);
    } else {
      // Reset form if no announcement exists
      this.title.set('');
      this.content.set('');
    }
  }

  public onSubmit(): void {
    if (!this.title().trim() || !this.content().trim()) {
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set('');

    try {
      const updatedAnnouncement = this.announcementService.createOrUpdateAnnouncement(
        this.title().trim(),
        this.content().trim()
      );
      
      this.currentAnnouncement.set(updatedAnnouncement);
      this.successMessage.set('Announcement updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage.set('');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating announcement:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public showDeleteConfirmation(): void {
    this.showDeleteConfirm.set(true);
  }

  public hideDeleteConfirmation(): void {
    this.showDeleteConfirm.set(false);
  }

  public confirmDelete(): void {
    const current = this.currentAnnouncement();
    if (!current) return;

    this.isDeleting.set(true);
    this.showDeleteConfirm.set(false);

    try {
      const deleted = this.announcementService.deleteAnnouncement(current.id);
      
      if (deleted) {
        // Clear the form and current announcement
        this.currentAnnouncement.set(null);
        this.title.set('');
        this.content.set('');
        this.successMessage.set('Announcement deleted successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    } finally {
      this.isDeleting.set(false);
    }
  }

  public logout(): void {
    this.adminService.logout();
    this.router.navigate(['/admin']);
  }

  public updateTitle(value: string): void {
    this.title.set(value);
  }

  public updateContent(value: string): void {
    this.content.set(value);
  }

  public formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  public getTotalLikes(): number {
    const announcement = this.currentAnnouncement();
    return announcement ? announcement.likes : 0;
  }

  public getTotalViewers(): number {
    return this.viewedUsers().length;
  }

  public hasAnnouncement(): boolean {
    return this.currentAnnouncement() !== null;
  }
}
