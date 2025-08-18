import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  public username = signal('');
  public password = signal('');
  public error = signal('');
  public isSubmitting = signal(false);

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  public onSubmit(): void {
    if (!this.username().trim() || !this.password().trim()) {
      this.error.set('Please enter both username and password');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    // Simulate a small delay for better UX
    setTimeout(() => {
      const isValid = this.adminService.login(this.username().trim(), this.password());
      
      if (isValid) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.error.set('Invalid username or password');
      }
      
      this.isSubmitting.set(false);
    }, 500);
  }

  public updateUsername(value: string): void {
    this.username.set(value);
    if (this.error()) {
      this.error.set('');
    }
  }

  public updatePassword(value: string): void {
    this.password.set(value);
    if (this.error()) {
      this.error.set('');
    }
  }

  public goBack(): void {
    this.router.navigate(['/']);
  }
}
