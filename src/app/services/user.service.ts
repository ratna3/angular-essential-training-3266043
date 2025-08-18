import { Injectable, signal, computed } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly STORAGE_KEY = 'announcement-portal-users';
  private readonly CURRENT_USER_KEY = 'announcement-portal-current-user';
  
  private users = signal<User[]>(this.loadUsers());
  private currentUser = signal<User | null>(this.loadCurrentUser());

  public users$ = this.users.asReadonly();
  public currentUser$ = this.currentUser.asReadonly();
  
  public viewedUsers = computed(() => 
    this.users().filter(user => user.hasViewed)
  );

  private loadUsers(): User[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private loadCurrentUser(): User | null {
    const stored = localStorage.getItem(this.CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private saveUsers(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users()));
  }

  private saveCurrentUser(): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser()));
  }

  public createUser(name: string, email: string): User {
    // Check if user exists
    const existingUser = this.users().find(u => u.email === email);
    if (existingUser) {
      this.currentUser.set(existingUser);
      this.saveCurrentUser();
      return existingUser;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      hasLiked: false,
      hasViewed: false,
      viewedAt: new Date()
    };

    this.users.update(users => [...users, newUser]);
    this.currentUser.set(newUser);
    this.saveUsers();
    this.saveCurrentUser();
    
    return newUser;
  }

  public markAsViewed(userId: string): void {
    this.users.update(users => 
      users.map(user => 
        user.id === userId 
          ? { ...user, hasViewed: true, viewedAt: new Date() }
          : user
      )
    );
    this.saveUsers();
  }

  public toggleLike(userId: string): boolean {
    let hasLiked = false;
    this.users.update(users => 
      users.map(user => {
        if (user.id === userId) {
          hasLiked = !user.hasLiked;
          return { ...user, hasLiked };
        }
        return user;
      })
    );
    this.saveUsers();
    return hasLiked;
  }

  public getCurrentUser(): User | null {
    return this.currentUser();
  }

  public logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  public getUserById(id: string): User | undefined {
    return this.users().find(user => user.id === id);
  }

  public clearAllData(): void {
    this.users.set([]);
    this.currentUser.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }
}
