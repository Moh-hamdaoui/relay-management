import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Login } from './login/login';
import { Register } from './register/register';
import { AuthGuard } from './auth.guard';
import { ProfileComponent } from './profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard }, // Temporairement sans guard pour debug
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },


];
