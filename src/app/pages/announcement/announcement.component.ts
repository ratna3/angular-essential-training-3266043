import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { Announcement } from '../../interfaces/announcement';
import { AnnouncementService } from '../../services/announcement.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css']
})
export class AnnouncementComponent implements OnInit {
  public currentUser = signal<User | null>(null);
  public announcement = signal<Announcement | null>(null);
  public selectedUser = signal<User | null>(null);
  public showUserDetails = signal(false);

  public hasLiked = computed(() => {
    const user = this.currentUser();
    const ann = this.announcement();
    return user && ann ? this.announcementService.hasUserLiked(ann.id, user.id) : false;
  });

  public viewedUsers = this.userService.viewedUsers;

  constructor(
    private userService: UserService,
    private announcementService: AnnouncementService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    this.currentUser.set(user);
    this.announcement.set(this.announcementService.getLatestAnnouncement());
    
    // Mark user as viewed
    this.userService.markAsViewed(user.id);
  }

  public toggleLike(): void {
    const user = this.currentUser();
    const ann = this.announcement();
    
    if (user && ann) {
      this.announcementService.toggleLike(ann.id, user.id);
      this.userService.toggleLike(user.id);
      
      // Update the announcement signal to reflect new like count
      this.announcement.set(this.announcementService.getLatestAnnouncement());
    }
  }

  public showUserDetail(user: User): void {
    this.selectedUser.set(user);
    this.showUserDetails.set(true);
  }

  public hideUserDetails(): void {
    this.showUserDetails.set(false);
    this.selectedUser.set(null);
  }

  public logout(): void {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  public formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
