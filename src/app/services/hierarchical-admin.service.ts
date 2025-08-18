import { Injectable, signal } from '@angular/core';
import { Admin } from '../interfaces/admin';
import { Role, IRRIGATION_ROLES } from '../interfaces/role';

@Injectable({
  providedIn: 'root'
})
export class HierarchicalAdminService {
  private readonly STORAGE_KEY = 'hierarchical_admins';
  private readonly CURRENT_ADMIN_KEY = 'current_hierarchical_admin';
  
  private adminUsersSignal = signal<Admin[]>([]);
  public currentAdminSignal = signal<Admin | null>(null);

  constructor() {
    this.initializeDefaultAdmins();
    this.loadCurrentAdmin();
  }

  private initializeDefaultAdmins(): void {
    const existingAdmins = this.getStoredAdmins();
    if (existingAdmins.length === 0) {
      // Create default admin users for testing
      const defaultAdmins: Admin[] = [
        {
          id: 'admin-001',
          username: 'minister',
          email: 'minister@irrigation.up.gov.in',
          password: 'minister123',
          role: IRRIGATION_ROLES[0], // Minister
          fullName: 'Hon. Irrigation Minister',
          employeeId: 'MIN-001',
          department: 'Irrigation Department',
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date()
        },
        {
          id: 'admin-002',
          username: 'principal_secretary',
          email: 'ps@irrigation.up.gov.in',
          password: 'ps123',
          role: IRRIGATION_ROLES[1], // Principal Secretary
          fullName: 'Principal Secretary',
          employeeId: 'PS-001',
          department: 'Irrigation Department',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'admin-003',
          username: 'ce1',
          email: 'ce1@irrigation.up.gov.in',
          password: 'ce1123',
          role: IRRIGATION_ROLES[2], // Chief Engineer-I
          fullName: 'Chief Engineer-I',
          employeeId: 'CE1-001',
          department: 'Technical Division',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'admin-004',
          username: 'ce2',
          email: 'ce2@irrigation.up.gov.in',
          password: 'ce2123',
          role: IRRIGATION_ROLES[3], // Chief Engineer-II
          fullName: 'Chief Engineer-II',
          employeeId: 'CE2-001',
          department: 'Technical Division',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'admin-005',
          username: 'sso',
          email: 'sso@irrigation.up.gov.in',
          password: 'sso123',
          role: IRRIGATION_ROLES[4], // Senior Staff Officer
          fullName: 'Senior Staff Officer',
          employeeId: 'SSO-001',
          department: 'Administrative Division',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'admin-006',
          username: 'se',
          email: 'se@irrigation.up.gov.in',
          password: 'se123',
          role: IRRIGATION_ROLES[5], // Superintending Engineer
          fullName: 'Superintending Engineer',
          employeeId: 'SE-001',
          department: 'Technical Division',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'admin-007',
          username: 'ee',
          email: 'ee@irrigation.up.gov.in',
          password: 'ee123',
          role: IRRIGATION_ROLES[6], // Executive Engineer
          fullName: 'Executive Engineer',
          employeeId: 'EE-001',
          department: 'Technical Division',
          isActive: true,
          createdAt: new Date()
        },
        // Keep the original admin for backward compatibility
        {
          id: 'admin-legacy',
          username: 'admin',
          email: 'admin@announcement.com',
          password: 'admin123',
          role: IRRIGATION_ROLES[2], // Chief Engineer-I level
          fullName: 'System Administrator',
          employeeId: 'ADMIN-001',
          department: 'IT Division',
          isActive: true,
          createdAt: new Date()
        }
      ];
      
      this.saveAdmins(defaultAdmins);
      this.adminUsersSignal.set(defaultAdmins);
    } else {
      this.adminUsersSignal.set(existingAdmins);
    }
  }

  public login(email: string, password: string): Admin | null {
    const admins = this.adminUsersSignal();
    const admin = admins.find(a => 
      (a.email === email || a.username === email) && 
      a.password === password && 
      a.isActive
    );

    if (admin) {
      admin.lastLogin = new Date();
      this.currentAdminSignal.set(admin);
      localStorage.setItem(this.CURRENT_ADMIN_KEY, JSON.stringify(admin));
      this.updateAdmin(admin);
      return admin;
    }
    return null;
  }

  public logout(): void {
    this.currentAdminSignal.set(null);
    localStorage.removeItem(this.CURRENT_ADMIN_KEY);
  }

  public getCurrentAdmin(): Admin | null {
    return this.currentAdminSignal();
  }

  public getSubordinateAdmins(currentAdmin: Admin): Admin[] {
    const allAdmins = this.adminUsersSignal();
    return allAdmins.filter(admin => 
      admin.role.seniorityLevel > currentAdmin.role.seniorityLevel &&
      admin.isActive
    );
  }

  public canViewAnnouncement(currentAdmin: Admin, announcementCreator: Admin): boolean {
    // Higher-ranked or same level officers can view announcements
    return currentAdmin.role.seniorityLevel <= announcementCreator.role.seniorityLevel;
  }

  public canEditAnnouncement(currentAdmin: Admin, announcementCreator: Admin): boolean {
    // Only same officer or higher-ranked can edit
    return currentAdmin.id === announcementCreator.id || 
           currentAdmin.role.seniorityLevel < announcementCreator.role.seniorityLevel;
  }

  public canDeleteAnnouncement(currentAdmin: Admin, announcementCreator: Admin): boolean {
    // Only same officer or higher-ranked can delete
    return currentAdmin.id === announcementCreator.id || 
           currentAdmin.role.seniorityLevel < announcementCreator.role.seniorityLevel;
  }

  public getAdminsByDepartment(): { [department: string]: Admin[] } {
    const admins = this.adminUsersSignal();
    const adminsByDept: { [department: string]: Admin[] } = {};
    
    admins.forEach(admin => {
      if (!adminsByDept[admin.department]) {
        adminsByDept[admin.department] = [];
      }
      adminsByDept[admin.department].push(admin);
    });

    // Sort admins within each department by seniority
    Object.keys(adminsByDept).forEach(dept => {
      adminsByDept[dept].sort((a, b) => a.role.seniorityLevel - b.role.seniorityLevel);
    });

    return adminsByDept;
  }

  public getHierarchyTree(): { [department: string]: Admin[] } {
    return this.getAdminsByDepartment();
  }

  public getAllRoles(): Role[] {
    return IRRIGATION_ROLES;
  }

  public getRoleById(roleId: number): Role | undefined {
    return IRRIGATION_ROLES.find(role => role.id === roleId);
  }

  public getAdminById(adminId: string): Admin | undefined {
    return this.adminUsersSignal().find(admin => admin.id === adminId);
  }

  private loadCurrentAdmin(): void {
    const stored = localStorage.getItem(this.CURRENT_ADMIN_KEY);
    if (stored) {
      try {
        const admin = JSON.parse(stored);
        this.currentAdminSignal.set(admin);
      } catch (error) {
        console.error('Error loading current admin:', error);
        localStorage.removeItem(this.CURRENT_ADMIN_KEY);
      }
    }
  }

  private getStoredAdmins(): Admin[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored admins:', error);
        return [];
      }
    }
    return [];
  }

  private saveAdmins(admins: Admin[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(admins));
    this.adminUsersSignal.set(admins);
  }

  private updateAdmin(updatedAdmin: Admin): void {
    const admins = this.adminUsersSignal();
    const index = admins.findIndex(admin => admin.id === updatedAdmin.id);
    if (index !== -1) {
      admins[index] = updatedAdmin;
      this.saveAdmins(admins);
    }
  }
}
