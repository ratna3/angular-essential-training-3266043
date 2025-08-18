import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  public nameValue = '';
  public emailValue = '';
  public errors: { name?: string; email?: string } = {};
  public isSubmitting = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  public onSubmit(): void {
    if (this.validateForm()) {
      this.isSubmitting = true;
      
      try {
        this.userService.createUser(this.nameValue, this.emailValue);
        this.router.navigate(['/announcement']);
      } catch (error) {
        console.error('Error creating user:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  private validateForm(): boolean {
    const newErrors: { name?: string; email?: string } = {};
    
    // Name validation
    if (!this.nameValue.trim()) {
      newErrors.name = 'Name is required';
    } else if (this.nameValue.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!this.emailValue.trim()) {
      newErrors.email = 'Email is required';
    } else if (!this.isValidEmail(this.emailValue.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public updateName(): void {
    if (this.errors.name) {
      this.errors = { ...this.errors, name: undefined };
    }
  }

  public updateEmail(): void {
    if (this.errors.email) {
      this.errors = { ...this.errors, email: undefined };
    }
  }
}
