import { Routes } from '@angular/router';
import MainLayoutComponent from './layout/main-layout/main-layout.component';
import AuthLayoutComponent from './layout/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import DocumentsComponent from './features/documentos/documentos.component';

export const routes: Routes = [
    {
      path: '',
      component: MainLayoutComponent,
      canActivate: [authGuard],
      children: [
        { path: '', redirectTo: 'documents', pathMatch: 'full' },
        //{ path: 'dashboard', component: DashboardComponent },
        { path: 'documents', component: DocumentsComponent }
      ]
    },
    {
      path: 'login',
      component: AuthLayoutComponent,
      children: [
        //{ path: 'login', component: LoginComponent }
      ]
    },
    { path: '**', redirectTo: 'login' } // fallback
  ];
  
