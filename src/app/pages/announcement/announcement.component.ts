import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AnnouncementService } from '../../services/announcement.service';

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css']
})
export class AnnouncementComponent implements OnInit {
  public showUserEmails = signal<Set<string>>(new Set());

  public announcement = this.announcementService.announcement$;
  public currentUser = this.userService.currentUser$;
  public users = this.userService.users$;
  public likesCount = computed(() => this.userService.getLikesCount());
  public hasAnnouncement = this.announcementService.hasAnnouncement;

  constructor(
    private userService: UserService,
    private announcementService: AnnouncementService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    // If no current user, redirect to landing
    if (!this.currentUser()) {
      this.router.navigate(['/']);
      return;
    }

    // Update view count when user views announcement
    const currentUser = this.currentUser();
    if (currentUser) {
      this.userService.updateUserView(currentUser.id);
      this.announcementService.incrementViewCount();
    }
  }

  public toggleLike(): void {
    const currentUser = this.currentUser();
    if (!currentUser) return;

    const wasLiked = currentUser.hasLiked;
    this.userService.toggleLike(currentUser.id);
    
    // Update announcement likes count
    if (wasLiked) {
      this.announcementService.decrementLikes();
    } else {
      this.announcementService.incrementLikes();
    }
  }

  public toggleUserEmail(userId: string): void {
    const currentEmails = this.showUserEmails();
    const newEmails = new Set(currentEmails);
    
    if (newEmails.has(userId)) {
      newEmails.delete(userId);
    } else {
      newEmails.add(userId);
    }
    
    this.showUserEmails.set(newEmails);
  }

  public logout(): void {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  public formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  public getTimeSince(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  public trackByUserId(index: number, user: any): string {
    return user.id;
  }
}
