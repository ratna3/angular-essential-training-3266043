import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreloadingService } from './services/preloading.service';
import { adminGuard } from './guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent),
    title: 'Announcement Portal | Welcome'
  },
  {
    path: 'announcement',
    loadComponent: () => import('./pages/announcement/announcement.component').then(m => m.AnnouncementComponent),
    title: 'Announcement Portal | Latest Announcement'
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
    title: 'Announcement Portal | Admin Login'
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    title: 'Announcement Portal | Admin Dashboard',
    canActivate: [adminGuard]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadingService })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
