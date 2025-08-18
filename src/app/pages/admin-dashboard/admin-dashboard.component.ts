import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  public activeTab = signal('overview');
  public announcementForm = signal({ title: '', content: '' });
  public isSubmitting = signal(false);
  public showDeleteConfirm = signal(false);
  public successMessage = signal('');
  public errorMessage = signal('');

  // Computed properties
  public admin = this.adminService.admin$;
  public announcement = this.announcementService.announcement$;
  public hasAnnouncement = this.announcementService.hasAnnouncement;
  public users = this.userService.users$;
  public userCount = this.userService.userCount;
  public likesCount = signal(0);

  constructor(
    private adminService: AdminService,
    private announcementService: AnnouncementService,
    private userService: UserService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    // Load existing announcement into form
    const currentAnnouncement = this.announcement();
    if (currentAnnouncement) {
      this.announcementForm.set({
        title: currentAnnouncement.title,
        content: currentAnnouncement.content
      });
    }

    // Calculate likes count
    this.likesCount.set(this.userService.getLikesCount());
  }

  public setActiveTab(tab: string): void {
    this.activeTab.set(tab);
    this.clearMessages();
  }

  public onAnnouncementSubmit(): void {
    const form = this.announcementForm();
    if (!form.title.trim() || !form.content.trim()) {
      this.errorMessage.set('Please fill in both title and content.');
      return;
    }

    this.isSubmitting.set(true);
    this.clearMessages();

    setTimeout(() => {
      try {
        if (this.hasAnnouncement()) {
          // Update existing announcement
          this.announcementService.updateAnnouncement(form.title.trim(), form.content.trim());
          this.successMessage.set('Announcement updated successfully!');
        } else {
          // Create new announcement
          this.announcementService.createAnnouncement(form.title.trim(), form.content.trim());
          this.successMessage.set('Announcement created successfully!');
        }
      } catch (error) {
        this.errorMessage.set('Failed to save announcement. Please try again.');
      } finally {
        this.isSubmitting.set(false);
      }
    }, 500);
  }

  public confirmDelete(): void {
    this.showDeleteConfirm.set(true);
    this.clearMessages();
  }

  public cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  public executeDelete(): void {
    this.isSubmitting.set(true);
    this.showDeleteConfirm.set(false);
    this.clearMessages();

    setTimeout(() => {
      try {
        this.announcementService.deleteAnnouncement();
        this.userService.clearUsers();
        this.announcementForm.set({ title: '', content: '' });
        this.successMessage.set('Announcement deleted successfully! All related data has been cleared.');
        this.setActiveTab('create');
      } catch (error) {
        this.errorMessage.set('Failed to delete announcement. Please try again.');
      } finally {
        this.isSubmitting.set(false);
        this.likesCount.set(0);
      }
    }, 500);
  }

  public updateForm(field: 'title' | 'content', value: string): void {
    this.announcementForm.update(form => ({ ...form, [field]: value }));
    this.clearMessages();
  }

  public logout(): void {
    this.adminService.logout();
    this.router.navigate(['/admin']);
  }

  public onTitleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateForm('title', target.value);
  }

  public onContentInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.updateForm('content', target.value);
  }

  public goToAnnouncement(): void {
    if (this.hasAnnouncement()) {
      window.open('/announcement', '_blank');
    }
  }

  public formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  public getTimeSince(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  private clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}
