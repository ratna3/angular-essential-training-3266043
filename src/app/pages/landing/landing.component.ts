import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  public name = signal('');
  public email = signal('');
  public isSubmitting = signal(false);
  public errors = signal<{ name?: string; email?: string }>({});

  // Getters for ngModel binding
  public get nameValue(): string {
    return this.name();
  }

  public set nameValue(value: string) {
    this.name.set(value);
  }

  public get emailValue(): string {
    return this.email();
  }

  public set emailValue(value: string) {
    this.email.set(value);
  }

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  public onSubmit(): void {
    if (this.validateForm()) {
      this.isSubmitting.set(true);
      
      // Add user and redirect
      this.userService.addUser(this.name(), this.email());
      this.router.navigate(['/announcement']);
    }
  }

  private validateForm(): boolean {
    const errors: { name?: string; email?: string } = {};
    
    if (!this.name().trim()) {
      errors.name = 'Name is required';
    }
    
    if (!this.email().trim()) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(this.email())) {
      errors.email = 'Please enter a valid email address';
    }
    
    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
