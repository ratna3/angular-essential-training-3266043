import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent),
    title: 'UPID Suchana Portal | Welcome'
  },
  {
    path: 'announcement',
    loadComponent: () => import('./pages/announcement/announcement.component').then(m => m.AnnouncementComponent),
    title: 'UPID Suchana Portal | Latest News'
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
    title: 'UPID Suchana Portal | Admin Login'
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    title: 'UPID Suchana Portal | Admin Dashboard',
    canActivate: [AdminGuard]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
