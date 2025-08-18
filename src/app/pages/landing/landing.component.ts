import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
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
  public name = signal('');
  public email = signal('');
  public errors = signal<{ name?: string; email?: string }>({});
  public isSubmitting = signal(false);

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  public onSubmit(): void {
    if (this.validateForm()) {
      this.isSubmitting.set(true);
      
      try {
        this.userService.createUser(this.name(), this.email());
        this.router.navigate(['/announcement']);
      } catch (error) {
        console.error('Error creating user:', error);
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }

  private validateForm(): boolean {
    const newErrors: { name?: string; email?: string } = {};
    
    // Name validation
    if (!this.name().trim()) {
      newErrors.name = 'Name is required';
    } else if (this.name().trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!this.email().trim()) {
      newErrors.email = 'Email is required';
    } else if (!this.isValidEmail(this.email().trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public updateName(value: string): void {
    this.name.set(value);
    if (this.errors().name) {
      this.errors.update(errors => ({ ...errors, name: undefined }));
    }
  }

  public updateEmail(value: string): void {
    this.email.set(value);
    if (this.errors().email) {
      this.errors.update(errors => ({ ...errors, email: undefined }));
    }
  }
}
