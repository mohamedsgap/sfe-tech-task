import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const USERS_PATH = 'users'

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./users-list-page/users-list-page.component').then(c => c.UsersListPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./user-form-page/user-form-page.component').then(c => c.UserFormPageComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./user-form-page/user-form-page.component').then(c => c.UserFormPageComponent),
    canActivate: [authGuard]
  }
]
