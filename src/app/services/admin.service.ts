import { Injectable, signal } from '@angular/core';
import { Admin } from '../interfaces/admin';
import { HierarchicalAdminService } from './hierarchical-admin.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly ADMIN_SESSION_KEY = 'announcement-portal-admin-session';
  
  // Legacy admin credentials for backward compatibility
  private readonly legacyAdminCredentials = {
    username: 'admin',
    password: 'admin123'
  };
  
  private isLoggedIn = signal<boolean>(this.loadAdminSession());
  private currentAdminSignal = signal<Admin | null>(null);
  
  public isLoggedIn$ = this.isLoggedIn.asReadonly();
  public currentAdmin$ = this.currentAdminSignal.asReadonly();

  constructor(private hierarchicalAdminService: HierarchicalAdminService) {
    this.loadCurrentAdmin();
  }

  private loadAdminSession(): boolean {
    return this.hierarchicalAdminService.getCurrentAdmin() !== null;
  }

  private loadCurrentAdmin(): void {
    const currentAdmin = this.hierarchicalAdminService.getCurrentAdmin();
    if (currentAdmin) {
      this.currentAdminSignal.set(currentAdmin);
      this.isLoggedIn.set(true);
    }
  }

  public login(username: string, password: string): boolean {
    // Try hierarchical admin login first
    const admin = this.hierarchicalAdminService.login(username, password);
    
    if (admin) {
      this.currentAdminSignal.set(admin);
      this.isLoggedIn.set(true);
      return true;
    }
    
    // Fall back to legacy admin for backward compatibility
    const isLegacyValid = (username === this.legacyAdminCredentials.username || 
                          username === 'admin@announcement.com') && 
                         password === this.legacyAdminCredentials.password;
    
    if (isLegacyValid) {
      // Create a legacy admin object
      const legacyAdmin = this.hierarchicalAdminService.getAdminById('admin-legacy');
      if (legacyAdmin) {
        this.currentAdminSignal.set(legacyAdmin);
        this.isLoggedIn.set(true);
        return true;
      }
    }
    
    return false;
  }

  public logout(): void {
    this.hierarchicalAdminService.logout();
    this.isLoggedIn.set(false);
    this.currentAdminSignal.set(null);
  }

  public isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  public getCurrentAdmin(): Admin | null {
    return this.currentAdminSignal();
  }

  public canEditAnnouncement(announcementCreator: Admin): boolean {
    const currentAdmin = this.getCurrentAdmin();
    if (!currentAdmin) return false;
    return this.hierarchicalAdminService.canEditAnnouncement(currentAdmin, announcementCreator);
  }

  public canDeleteAnnouncement(announcementCreator: Admin): boolean {
    const currentAdmin = this.getCurrentAdmin();
    if (!currentAdmin) return false;
    return this.hierarchicalAdminService.canDeleteAnnouncement(currentAdmin, announcementCreator);
  }

  public canViewAnnouncement(announcementCreator: Admin): boolean {
    const currentAdmin = this.getCurrentAdmin();
    if (!currentAdmin) return false;
    return this.hierarchicalAdminService.canViewAnnouncement(currentAdmin, announcementCreator);
  }
}
