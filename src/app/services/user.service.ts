import { Injectable, computed, signal } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users = signal<User[]>([]);
  private currentUser = signal<User | null>(null);

  public users$ = computed(() => this.users());
  public currentUser$ = computed(() => this.currentUser());
  public userCount = computed(() => this.users().length);

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    const storedUsers = localStorage.getItem('announcement-portal-users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers).map((user: any) => ({
        ...user,
        viewedAt: new Date(user.viewedAt)
      }));
      this.users.set(users);
    }
  }

  private saveUsers(): void {
    localStorage.setItem('announcement-portal-users', JSON.stringify(this.users()));
  }

  public addUser(name: string, email: string): User {
    const existingUser = this.users().find(u => u.email === email);
    if (existingUser) {
      this.currentUser.set(existingUser);
      this.updateUserView(existingUser.id);
      return existingUser;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      hasLiked: false,
      viewedAt: new Date()
    };

    this.users.update(users => [...users, newUser]);
    this.currentUser.set(newUser);
    this.saveUsers();
    return newUser;
  }

  public updateUserView(userId: string): void {
    this.users.update(users => 
      users.map(user => 
        user.id === userId 
          ? { ...user, viewedAt: new Date() }
          : user
      )
    );
    this.saveUsers();
  }

  public toggleLike(userId: string): void {
    this.users.update(users => 
      users.map(user => 
        user.id === userId 
          ? { ...user, hasLiked: !user.hasLiked }
          : user
      )
    );
    this.saveUsers();
    
    // Update current user if it's the one being updated
    const updatedUser = this.users().find(u => u.id === userId);
    if (updatedUser && this.currentUser()?.id === userId) {
      this.currentUser.set(updatedUser);
    }
  }

  public getLikesCount(): number {
    return this.users().filter(user => user.hasLiked).length;
  }

  public clearUsers(): void {
    this.users.set([]);
    this.currentUser.set(null);
    localStorage.removeItem('announcement-portal-users');
  }

  public setCurrentUser(user: User): void {
    this.currentUser.set(user);
  }

  public logout(): void {
    this.currentUser.set(null);
  }
}
