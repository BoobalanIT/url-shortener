import { Routes } from '@angular/router';
import { Login } from './pages/login/login.js';
import { Register } from './pages/register/register.js';
import { Dashboard } from './pages/dashboard/dashboard.js';
import { authGuard } from './guards/auth-guard.js';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
];