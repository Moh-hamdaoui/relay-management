import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Login } from './login/login';
import { Register } from './register/register';
import { MyAbsences } from './my-absences/my-absences';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'mes-absences', component: MyAbsences, canActivate: [AuthGuard] },
];
