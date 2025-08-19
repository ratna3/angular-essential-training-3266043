import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Check if user is authenticated as admin and has valid session
    const isAuthenticated = this.adminService.isAuthenticated();
    const hasValidSession = this.adminService.getCurrentAdmin() !== null;
    
    if (isAuthenticated && hasValidSession) {
      return true;
    }
    
    // Redirect to admin login if not authenticated
    this.router.navigate(['/admin']);
    return false;
  }
}
