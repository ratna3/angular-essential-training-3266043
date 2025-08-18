import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Announcement } from '../../interfaces/announcement';
import { FileAttachment } from '../../interfaces/file-attachment';
import { AdminService } from '../../services/admin.service';
import { AnnouncementService } from '../../services/announcement.service';
import { UserService } from '../../services/user.service';
import { FileService } from '../../services/file.service';

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
  public editingAnnouncementId = signal<string | null>(null);
  public selectedFiles = signal<File[]>([]);
  public uploadedAttachments = signal<FileAttachment[]>([]);
  public isUploadingFiles = signal(false);

  public viewedUsers = this.userService.viewedUsers;

  constructor(
    private adminService: AdminService,
    private announcementService: AnnouncementService,
    private userService: UserService,
    private fileService: FileService,
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
    
    // Don't pre-fill the form when not editing - let admin create new announcements
    if (!this.editingAnnouncementId()) {
      this.title.set('');
      this.content.set('');
      this.uploadedAttachments.set([]);
      this.selectedFiles.set([]);
    }
  }

  public async onSubmit(): Promise<void> {
    if (!this.title().trim() || !this.content().trim()) {
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set('');

    try {
      // Upload files if any selected
      const allAttachments = [...this.uploadedAttachments()];
      
      if (this.selectedFiles().length > 0) {
        this.isUploadingFiles.set(true);
        
        for (const file of this.selectedFiles()) {
          try {
            const attachment = await this.fileService.uploadFile(file);
            allAttachments.push(attachment);
          } catch (error) {
            console.error('Error uploading file:', error);
            // Continue with other files
          }
        }
        
        this.isUploadingFiles.set(false);
      }

      const editingId = this.editingAnnouncementId();
      
      if (editingId) {
        // Update existing announcement
        const updated = this.announcementService.updateAnnouncement(
          editingId,
          this.title().trim(),
          this.content().trim(),
          allAttachments
        );
        
        if (updated) {
          this.successMessage.set('Announcement updated successfully!');
          this.cancelEdit();
        }
      } else {
        // Create new announcement
        this.announcementService.createNewAnnouncement(
          this.title().trim(),
          this.content().trim(),
          allAttachments
        );
        this.successMessage.set('New announcement created successfully!');
        
        // Clear form after creating
        this.title.set('');
        this.content.set('');
        this.selectedFiles.set([]);
        this.uploadedAttachments.set([]);
      }
      
      this.currentAnnouncement.set(this.announcementService.getLatestAnnouncement());
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage.set('');
      }, 3000);
      
    } catch (error) {
      console.error('Error with announcement:', error);
    } finally {
      this.isSubmitting.set(false);
      this.isUploadingFiles.set(false);
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

  public getTotalAnnouncements(): number {
    return this.announcementService.getAllAnnouncements().length;
  }

  public isEditMode(): boolean {
    return this.editingAnnouncementId() !== null;
  }

  public editCurrentAnnouncement(): void {
    const current = this.currentAnnouncement();
    if (current) {
      this.editingAnnouncementId.set(current.id);
      this.title.set(current.title);
      this.content.set(current.content);
      this.uploadedAttachments.set([...current.attachments]);
      this.selectedFiles.set([]);
    }
  }

  public cancelEdit(): void {
    this.editingAnnouncementId.set(null);
    this.title.set('');
    this.content.set('');
    this.uploadedAttachments.set([]);
    this.selectedFiles.set([]);
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      this.selectedFiles.update(files => [...files, ...newFiles]);
      
      // Clear the input so the same file can be selected again
      input.value = '';
    }
  }

  public removeSelectedFile(index: number): void {
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
  }

  public removeUploadedAttachment(index: number): void {
    this.uploadedAttachments.update(attachments => attachments.filter((_, i) => i !== index));
  }

  public getFileIcon(fileType: string): string {
    return this.fileService.getFileIcon(fileType);
  }

  public formatFileSize(bytes: number): string {
    return this.fileService.formatFileSize(bytes);
  }

  public getTotalFileSize(): number {
    const selectedSize = this.selectedFiles().reduce((total, file) => total + file.size, 0);
    const uploadedSize = this.uploadedAttachments().reduce((total, att) => total + att.size, 0);
    return selectedSize + uploadedSize;
  }
}
