import { Injectable, signal } from '@angular/core';
import { Admin } from '../interfaces/admin';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly ADMIN_SESSION_KEY = 'announcement-portal-admin-session';
  
  private readonly adminCredentials: Admin = {
    username: 'adminIndia',
    password: 'Indi@446'
  };
  
  private isLoggedIn = signal<boolean>(this.loadAdminSession());
  
  public isLoggedIn$ = this.isLoggedIn.asReadonly();

  private loadAdminSession(): boolean {
    const session = localStorage.getItem(this.ADMIN_SESSION_KEY);
    return session === 'true';
  }

  private saveAdminSession(loggedIn: boolean): void {
    if (loggedIn) {
      localStorage.setItem(this.ADMIN_SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(this.ADMIN_SESSION_KEY);
    }
  }

  public login(username: string, password: string): boolean {
    const isValid = username === this.adminCredentials.username && 
                   password === this.adminCredentials.password;
    
    if (isValid) {
      this.isLoggedIn.set(true);
      this.saveAdminSession(true);
    }
    
    return isValid;
  }

  public logout(): void {
    this.isLoggedIn.set(false);
    this.saveAdminSession(false);
  }

  public isAuthenticated(): boolean {
    return this.isLoggedIn();
  }
}
