import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { Announcement } from '../../interfaces/announcement';
import { FileAttachment } from '../../interfaces/file-attachment';
import { AnnouncementService } from '../../services/announcement.service';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css']
})
export class AnnouncementComponent implements OnInit {
  public currentUser = signal<User | null>(null);
  public announcement = signal<Announcement | null>(null);
  public selectedUser = signal<User | null>(null);
  public showUserDetails = signal(false);
  public showDeleteConfirm = signal(false);
  public isDeleting = signal(false);

  public hasLiked = computed(() => {
    const user = this.currentUser();
    const ann = this.announcement();
    return user && ann ? this.announcementService.hasUserLiked(ann.id, user.id) : false;
  });

  public isAdmin = computed(() => {
    return this.adminService.isAuthenticated();
  });

  public viewedUsers = this.userService.viewedUsers;

  constructor(
    private userService: UserService,
    private announcementService: AnnouncementService,
    private adminService: AdminService,
    private fileService: FileService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    this.currentUser.set(user);
    this.announcement.set(this.announcementService.getLatestAnnouncement());
    
    // Mark user as viewed
    this.userService.markAsViewed(user.id);
  }

  public toggleLike(): void {
    const user = this.currentUser();
    const ann = this.announcement();
    
    if (user && ann) {
      this.announcementService.toggleLike(ann.id, user.id);
      this.userService.toggleLike(user.id);
      
      // Update the announcement signal to reflect new like count
      this.announcement.set(this.announcementService.getLatestAnnouncement());
    }
  }

  public showUserDetail(user: User): void {
    this.selectedUser.set(user);
    this.showUserDetails.set(true);
  }

  public hideUserDetails(): void {
    this.showUserDetails.set(false);
    this.selectedUser.set(null);
  }

  public logout(): void {
    this.userService.logout();
    this.router.navigate(['/']);
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

  public hasAnnouncement(): boolean {
    return this.announcement() !== null;
  }

  public confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  public cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  public deleteAnnouncement(): void {
    const ann = this.announcement();
    if (!ann) return;

    this.isDeleting.set(true);
    
    const success = this.announcementService.deleteAnnouncement(ann.id);
    
    if (success) {
      // Refresh to show updated announcement or no announcement
      this.announcement.set(this.announcementService.getLatestAnnouncement());
      this.showDeleteConfirm.set(false);
    }
    
    this.isDeleting.set(false);
  }

  public goToAdminDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  public viewFile(attachment: FileAttachment): void {
    const user = this.currentUser();
    if (user) {
      this.fileService.viewFile(attachment.id, user.id, user.name, user.email);
    }
  }

  public downloadFile(attachment: FileAttachment): void {
    const user = this.currentUser();
    if (user) {
      this.fileService.downloadFile(attachment.id, user.id, user.name, user.email);
    }
  }

  public getFileIcon(fileType: string): string {
    return this.fileService.getFileIcon(fileType);
  }

  public formatFileSize(bytes: number): string {
    return this.fileService.formatFileSize(bytes);
  }

  public isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  public getImagePreview(attachment: FileAttachment): string {
    return this.isImageFile(attachment.type) ? attachment.data : '';
  }
}
