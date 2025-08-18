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
  public successMessage = signal('');
  public currentAnnouncement = signal<Announcement | null>(null);

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
}
