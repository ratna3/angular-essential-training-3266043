import { Injectable, computed, signal } from '@angular/core';
import { Admin, AdminCredentials } from '../interfaces/admin';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private admin = signal<Admin>({ username: '', isAuthenticated: false });

  public admin$ = computed(() => this.admin());
  public isAuthenticated = computed(() => this.admin().isAuthenticated);

  private readonly ADMIN_CREDENTIALS: AdminCredentials = {
    username: 'adminIndia',
    password: 'Indi@446'
  };

  constructor() {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const storedAuth = localStorage.getItem('announcement-portal-admin-auth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      if (authData.isAuthenticated && authData.username === this.ADMIN_CREDENTIALS.username) {
        this.admin.set({ username: authData.username, isAuthenticated: true });
      }
    }
  }

  public login(credentials: AdminCredentials): boolean {
    if (credentials.username === this.ADMIN_CREDENTIALS.username && 
        credentials.password === this.ADMIN_CREDENTIALS.password) {
      
      const adminData: Admin = {
        username: credentials.username,
        isAuthenticated: true
      };
      
      this.admin.set(adminData);
      localStorage.setItem('announcement-portal-admin-auth', JSON.stringify(adminData));
      return true;
    }
    return false;
  }

  public logout(): void {
    this.admin.set({ username: '', isAuthenticated: false });
    localStorage.removeItem('announcement-portal-admin-auth');
  }
}
