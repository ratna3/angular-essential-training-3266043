import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  public usernameValue = '';
  public passwordValue = '';
  public errorMessage = '';
  public isSubmitting = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  public onSubmit(): void {
    if (!this.usernameValue.trim() || !this.passwordValue.trim()) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Simulate a small delay for better UX
    setTimeout(() => {
      const isValid = this.adminService.login(this.usernameValue.trim(), this.passwordValue);
      
      if (isValid) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.errorMessage = 'Invalid username or password';
      }
      
      this.isSubmitting = false;
    }, 500);
  }

  public updateUsername(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  public updatePassword(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  public goBack(): void {
    this.router.navigate(['/']);
  }
}
