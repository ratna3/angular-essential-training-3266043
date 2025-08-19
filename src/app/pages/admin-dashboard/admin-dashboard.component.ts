import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Announcement } from '../../interfaces/announcement';
import { FileAttachment } from '../../interfaces/file-attachment';
import { Admin } from '../../interfaces/admin';
import { AdminService } from '../../services/admin.service';
import { AnnouncementService } from '../../services/announcement.service';
import { UserService } from '../../services/user.service';
import { FileService } from '../../services/file.service';
import { HierarchicalAdminService } from '../../services/hierarchical-admin.service';
import { RoleHierarchyComponent } from '../../components/role-hierarchy/role-hierarchy.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RoleHierarchyComponent],
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
  public fileErrors = signal<string[]>([]);
  
  // Hierarchical admin properties
  public currentAdmin = signal<Admin | null>(null);
  public selectedOfficer = signal<Admin | null>(null);
  public selectedOfficerAnnouncements = signal<Announcement[]>([]);
  public showHierarchy = signal(false);

  public viewedUsers = this.userService.viewedUsers;

  constructor(
    private adminService: AdminService,
    private announcementService: AnnouncementService,
    private userService: UserService,
    private fileService: FileService,
    private hierarchicalAdminService: HierarchicalAdminService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    if (!this.adminService.isAuthenticated()) {
      this.router.navigate(['/admin']);
      return;
    }

    // Load current admin information
    const admin = this.adminService.getCurrentAdmin();
    this.currentAdmin.set(admin);

    this.loadCurrentAnnouncement();
    
    // Set up callback to sync download counts
    this.fileService.setDownloadCallback((fileId: string) => {
      this.announcementService.updateFileDownloadCount(fileId);
      // Refresh the current announcement to show updated download counts
      this.loadCurrentAnnouncement();
    });
    
    // Refresh data periodically to show updated download counts
    setInterval(() => {
      this.loadCurrentAnnouncement();
    }, 30000); // Refresh every 30 seconds
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

  public getTotalDownloads(): number {
    // First sync file downloads to ensure we have latest data
    this.announcementService.syncFileDownloads(this.fileService);
    
    // Get all files from all announcements and sum their downloads
    const allAnnouncements = this.announcementService.getAllAnnouncements();
    let totalDownloads = 0;
    
    allAnnouncements.forEach(announcement => {
      if (announcement.attachments) {
        announcement.attachments.forEach(attachment => {
          totalDownloads += attachment.downloads;
        });
      }
    });
    
    return totalDownloads;
  }

  public getTopDownloadedFiles(): FileAttachment[] {
    // First sync file downloads to ensure we have latest data
    this.announcementService.syncFileDownloads(this.fileService);
    
    // Get all files from all announcements and sort by downloads
    const allFiles: FileAttachment[] = [];
    const allAnnouncements = this.announcementService.getAllAnnouncements();
    
    allAnnouncements.forEach(announcement => {
      if (announcement.attachments) {
        allFiles.push(...announcement.attachments);
      }
    });
    
    // Sort by downloads in descending order
    return allFiles.sort((a, b) => b.downloads - a.downloads);
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
      
      // Validate files before adding
      const validFiles: File[] = [];
      const errors: string[] = [];
      
      for (const file of newFiles) {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          errors.push(`${file.name}: File size exceeds 10MB limit`);
          continue;
        }
        
        // Check if file already exists
        const existingFile = this.selectedFiles().find(f => f.name === file.name && f.size === file.size);
        if (existingFile) {
          errors.push(`${file.name}: File already selected`);
          continue;
        }
        
        validFiles.push(file);
      }
      
      // Update errors
      this.fileErrors.set(errors);
      
      // Add valid files
      if (validFiles.length > 0) {
        this.selectedFiles.update(files => [...files, ...validFiles]);
        
        // Show success message for selected files
        if (validFiles.length === 1) {
          this.successMessage.set(`File "${validFiles[0].name}" selected successfully!`);
        } else {
          this.successMessage.set(`${validFiles.length} files selected successfully!`);
        }
        
        // Clear success message after 2 seconds
        setTimeout(() => {
          this.successMessage.set('');
        }, 2000);
      }
      
      // Clear errors after 5 seconds if any
      if (errors.length > 0) {
        setTimeout(() => {
          this.fileErrors.set([]);
        }, 5000);
      }
      
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

  // Hierarchical admin methods
  public toggleHierarchy(): void {
    this.showHierarchy.update(show => !show);
  }

  public onSelectOfficer(officer: Admin): void {
    this.selectedOfficer.set(officer);
    const announcements = this.announcementService.getAnnouncementsByOfficer(officer.id);
    this.selectedOfficerAnnouncements.set(announcements);
  }

  public getSubordinateAnnouncements(): Announcement[] {
    return this.announcementService.getSubordinateAnnouncements();
  }

  public canEditSelectedAnnouncement(announcement: Announcement): boolean {
    const currentAdmin = this.currentAdmin();
    if (!currentAdmin) return false;
    return this.announcementService.canEditAnnouncement(announcement, currentAdmin);
  }

  public canDeleteSelectedAnnouncement(announcement: Announcement): boolean {
    const currentAdmin = this.currentAdmin();
    if (!currentAdmin) return false;
    return this.announcementService.canDeleteAnnouncement(announcement, currentAdmin);
  }

  public getAnnouncementCreatorInfo(announcement: Announcement): string {
    const creator = announcement.createdBy;
    return `${creator.fullName} (${creator.role.displayName}) - ${creator.department}`;
  }

  public getAnnouncementPriorityBadge(priority?: string): string {
    const badges: { [key: string]: string } = {
      'urgent': 'bg-danger',
      'high': 'bg-warning text-dark',
      'medium': 'bg-info',
      'low': 'bg-secondary'
    };
    return badges[priority || 'medium'] || 'bg-secondary';
  }

  public getRoleHierarchyLevel(): number {
    const currentAdmin = this.currentAdmin();
    return currentAdmin?.role.seniorityLevel || 10;
  }

  public hasSubordinates(): boolean {
    const currentAdmin = this.currentAdmin();
    if (!currentAdmin) return false;
    const subordinates = this.hierarchicalAdminService.getSubordinateAdmins(currentAdmin);
    return subordinates.length > 0;
  }

  public editAnnouncement(announcementId: string): void {
    const announcement = this.announcementService.getAllAnnouncements().find(a => a.id === announcementId);
    if (announcement) {
      const currentAdmin = this.currentAdmin();
      if (currentAdmin && this.announcementService.canEditAnnouncement(announcement, currentAdmin)) {
        this.editingAnnouncementId.set(announcementId);
        this.title.set(announcement.title);
        this.content.set(announcement.content);
        this.uploadedAttachments.set(announcement.attachments || []);
        this.selectedFiles.set([]);
        
        // Scroll to the form
        const formElement = document.querySelector('.card');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        alert('You do not have permission to edit this announcement.');
      }
    }
  }

  public deleteSpecificAnnouncement(announcementId: string): void {
    const announcement = this.announcementService.getAllAnnouncements().find(a => a.id === announcementId);
    if (announcement) {
      const currentAdmin = this.currentAdmin();
      if (currentAdmin && this.announcementService.canDeleteAnnouncement(announcement, currentAdmin)) {
        if (confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
          const success = this.announcementService.deleteAnnouncement(announcementId);
          if (success) {
            this.successMessage.set('Announcement deleted successfully!');
            // Refresh the selected officer's announcements
            const selectedOfficer = this.selectedOfficer();
            if (selectedOfficer) {
              this.onSelectOfficer(selectedOfficer);
            }
            // Clear the success message after 3 seconds
            setTimeout(() => this.successMessage.set(''), 3000);
          }
        }
      } else {
        alert('You do not have permission to delete this announcement.');
      }
    }
  }
}
