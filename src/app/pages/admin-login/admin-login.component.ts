import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminCredentials } from '../../interfaces/admin';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  public credentials = signal<AdminCredentials>({ username: '', password: '' });
  public isSubmitting = signal(false);
  public errorMessage = signal('');
  public showPassword = signal(false);

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {
    // If already authenticated, redirect to dashboard
    if (this.adminService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  public onSubmit(): void {
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      const success = this.adminService.login(this.credentials());
      
      if (success) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.errorMessage.set('Invalid username or password. Please try again.');
      }
      
      this.isSubmitting.set(false);
    }, 500);
  }

  public togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  public updateCredentials(field: keyof AdminCredentials, value: string): void {
    this.credentials.update(creds => ({ ...creds, [field]: value }));
    // Clear error when user starts typing
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  public onUsernameInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateCredentials('username', target.value);
  }

  public onPasswordInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateCredentials('password', target.value);
  }

  public goHome(): void {
    this.router.navigate(['/']);
  }
}
